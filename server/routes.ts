export function registerRoutes(app, db, io) {
    app.get('/api/routes', async (req, res) => {
        const [rows] = await db.query('SELECT * FROM routes');
        res.json(rows);
    });

    app.post('/api/panic', async (req, res) => {
        const { userId, tipo } = req.body;
        await db.query('INSERT INTO panic_alerts (userId,tipo) VALUES (?,?)', [userId, tipo]);
        io.emit('panic', { userId, tipo });
        res.json({ ok: true });
    });
}
