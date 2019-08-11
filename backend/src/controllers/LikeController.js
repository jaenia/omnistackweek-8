const Dev = require('../models/Dev');

module.exports = {
    async store(req, res) { 
        console.log(req.io, req.connectedUsers);      
        const { user } = req.headers;
        const { devId } = req.params;

        const loggedDev = await Dev.findById(user);
        const targetDev = await Dev.findById(devId);

        if (!targetDev) {
            return res.status(400).json({ error: 'Dev not exists' });
        }

        if (targetDev.likes.includes(loggedDev._id)){
            // buscar conexão ativa dos usuários envolvidos
            const loggedSocket = req.connectedUsers[user];
            const targetSocket = req.connectedUsers[devId];
            
            if (loggedSocket) {
                // avisando para o usuário logado que ele deu match com o dev que ele deu o like
                req.io.to(loggedSocket).emit('match', targetDev);
            }
            if (targetSocket) {
                // avisando para o usuário alvo que ele deu match com o usuário logado
                req.io.to(targetSocket).emit('match', loggedDev);
            }
        }

        loggedDev.likes.push(targetDev._id);

        await loggedDev.save();

        return res.json(loggedDev);
    }
}