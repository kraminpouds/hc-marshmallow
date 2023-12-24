import { Router } from "express";
import { JsonDB, Config } from 'node-json-db';
import { v4 } from 'uuid';
import { Box, Letter } from './model';

const db = new JsonDB(new Config("db", true, true, '/'));
await db.reload();

const router = Router();

router.get('/api/box', async (req, res) => {
    const data = await db.getObjectDefault("/boxes", []);
    res.status(200).end(JSON.stringify(data.filter(d=>d.enabled)));
});

router.get('/api/box/all', async (req, res) => {
    const data = await db.getObjectDefault("/boxes", []);
    res.status(200).end(JSON.stringify(data));
});

// add new box
router.put('/api/box', async (req, res) => {
    const box = { enabled: false, ...req.body, uuid: v4() };
    await db.push("/boxes[]", box, true);
    res.status(200).end(JSON.stringify(box));
});

router.patch('/api/box', async (req, res) => {
    try {
        const box = req.body as Box;
        if (box.uuid) {
            const index = await db.getIndex("/boxes", box.uuid, 'uuid');
            if(index>=0) {
                await db.push(`/boxes[${index}]`, box, true);
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

router.get('/api/letter/:boxUUID', async (req, res) => {
    try {
        if (req.params.boxUUID) {
            const data = await db.getObjectDefault(`/letters/${req.params.boxUUID}`, []);
            res.status(200).end(JSON.stringify(data));
        } else {
            res.status(200).end(JSON.stringify([]));
        }
    } catch (e) {
        res.status(500).end(e);
    }
});

router.put('/api/letter', async (req, res) => {
    try {
        const letter = req.body as Letter;
        await db.push(`/letters/${letter.boxUUID}[]`, { ...letter, uuid: v4(), isRead: false, remark: '', createDate: Date.now().valueOf() }, true);
        res.status(200).end();
    } catch (e) {
        res.status(500).end(e);
    }
});

router.patch('/api/letter', async (req, res) => {
    try {
        const letter = req.body as Letter;
        if (letter.boxUUID && letter.uuid) {
            const index = await db.getIndex(`/letters/${letter.boxUUID}`, letter.uuid, 'uuid');
            if(index>=0) {
                await db.push(`/letters/${letter.boxUUID}[${index}]`, letter, true);
            }
            res.status(200).end();
        } else {
            res.status(400).end();
        }
    } catch (e) {
        res.status(500).end(e);
    }
});

router.delete('/api/letter/:boxUUID/:uuid', async (req, res) => {
    try {
        if (req.params.boxUUID && req.params.uuid) {
            const index = await db.getIndex(`/letters/${req.params.boxUUID}`, req.params.uuid, 'uuid');
            if(index>=0) {
                await db.delete(`/letters/${req.params.boxUUID}[${index}]`);
            }
            res.status(200).end();
        } else {
            res.status(400).end();
        }
    } catch (e) {
        res.status(500).end(e);
    }
});

export default router;