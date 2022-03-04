import db_adm_conn from "./db/index.js";

export const getAbout = async (req, res) => {
    var result = {
        client: {
            host: req.socket.remoteAddress.substring(req.socket.remoteAddress.lastIndexOf(':') + 1)
        },
        server: {
            current_time: Math.round((new Date()).getTime() / 1000),
            services: []
        }
    }
    var service_results = await db_adm_conn.query('SELECT service_name, service_id FROM services');
    for (var row of service_results.rows) {
        
        var service_action_results = await db_adm_conn.query(`SELECT trigger_name as name, description FROM triggers WHERE service_id = '${row.service_id}'`)
        var service_reaction_results = await db_adm_conn.query(`SELECT reaction_name as name, description FROM reactions WHERE service_id = '${row.service_id}'`)
        var service = {
            name: row.service_name,
            actions: service_action_results.rows || null,
            reactions: service_reaction_results.rows || null
        }
        result.server.services.push(service)
    }
    res.send(result)

} 