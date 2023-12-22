import { Router } from "express";
import { JsonDB, Config } from 'node-json-db';
import { v4 } from 'uuid';
import { Letter } from './model';

const db = new JsonDB(new Config("db", true, false, '/'));
await db.reload();

const router = Router();

router.get('/api/box', async (req, res) => {
    const data = await db.getObjectDefault("/boxes", []);
    res.status(200).end(JSON.stringify(data));
});

// add new box
router.put('/api/box', async (req, res) => {
    await db.push("/boxes[]", { enabled: false, ...req.body, uuid: v4() }, true);
    res.status(200).end();
});

router.patch('/api/box', async (req, res) => {
    try {
        if (req.body.uuid) {
            const index = await db.getIndex("/boxes", req.body.id, 'uuid');
            if(index>=0) {
                await db.push(`/boxes[${index}]`, req.body, true);
            }
            res.status(200).end();
        } else {
            res.status(400).end();
        }
    } catch (e) {
        res.status(500).end(e);
    }
});

router.post('/api/box/enable', async (req, res) => {
    try {
        if (req.body.uuid) {
            const index = await db.getIndex("/boxes", req.body.id, 'uuid');
            if(index>=0) {
                await db.push(`/boxes[${index}]/enabled`, true, true);
            }
            res.status(200).end();
        } else {
            res.status(400).end();
        }
    } catch (e) {
        res.status(500).end(e);
    }
});

router.post('/api/box/disable', async (req, res) => {
    try {
        if (req.body.uuid) {
            const index = await db.getIndex("/boxes", req.body.id, 'uuid');
            if(index>=0) {
                await db.push(`/boxes[${index}]/enabled`, false, true);
            }
            res.status(200).end();
        } else {
            res.status(400).end();
        }
    } catch (e) {
        res.status(500).end(e);
    }
});

router.put('/api/letter', async (req, res) => {
    try {
        const letter = req.body as Letter;
        await db.push(`/letters/${letter.boxUUID}[]`, { ...letter, uuid: v4(), isRead: false, remark: '' }, true);
        res.status(200).end();
    } catch (e) {
        res.status(500).end(e);
    }
});

export default router;