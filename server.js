import fs from 'node:fs/promises'
import express from 'express'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import session from 'express-session'

// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'

// 管理员
const users = [
  { id: 1, username: 'hu', password: 'hu' },
  { id: 2, username: 'cao', password: 'cao' },
];


// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : ''
const ssrManifest = isProduction
  ? await fs.readFile('./dist/client/ssr-manifest.json', 'utf-8')
  : undefined

// 连接到MongoDB
// mongoose.connect(`mongodb://localhost:27017/${db}`).then(() => console.log('Connected MongoDB!'));


// Create http server
const app = express()
app.use(express.json());
// 使用express-session中间件，设置会话
app.use(session({
  secret: 'hc-marshmallow',
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
}));

// 初始化Passport并使用session
app.use(passport.initialize());
app.use(passport.session({ }));

// Passport配置本地策略
passport.use(new LocalStrategy({ },
    (username, password, done) => {
      console.log('authenticate', username, password)
      // 在这里验证用户名和密码
      const user = users.find(u => u.username === username && u.password === password);

      if (!user) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }

      return done(null, user);
    }
));

// 序列化用户对象到session
passport.serializeUser((user, done) => {
  process.nextTick(function() {
    done(null, user.id);
  });
});

// 从session中反序列化用户对象
passport.deserializeUser((id, done) => {
  process.nextTick(function() {
    const user = users.find(u => u.id === id);
    done(null, user);
  });
});



// Add Vite or respective production middlewares
let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv('./dist/client', { extensions: [] }))
}

app.post('/xumu/password', passport.authenticate('local', {
  successRedirect: '/xumu'
}));

// Serve HTML
app.use('*', isAuthenticated, async (req, res) => {
  try {
    const url = req.originalUrl

    let template
    let render
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render
    } else {
      template = templateHtml
      render = (await import('./dist/server/entry-server.js')).render
    }

    const rendered = await render(req)

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '')

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})

// 辅助函数：检查用户是否已经登录
function isAuthenticated(req, res, next) {
  if (req.originalUrl !== '/xumu' || req.isAuthenticated()) {
    return next();
  }
  res.redirect('/xumu/login');
}

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
