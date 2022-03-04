import SpotifyClient from 'spotify-web-api-node'
import { get_access_token } from '../../db/tokens.js'
import { client_id, client_secret, redirect_uri } from './tokens.js'


export const getClient = async (userid) => {
    try {
        var client = new SpotifyClient({
            clientId: client_id,
            clientSecret: client_secret,
            redirectUri: redirect_uri
        })
        var access_token = await get_access_token('spotify', userid)
        client.setAccessToken(access_token)
        return client
    } catch (err) {
        console.log(err.stack)
    }
}


export const searchForPlaylist = async (req, res) => {
    try {
        var playlistname = req.query.playlistname
        var client = await getClient(req.user.userid)
        var offset = req.query.offset || 0

        client.searchPlaylists(playlistname, { offset: offset }).then((obj) => {
            res.send(obj.body)
        })
    } catch (err) {
        console.log(err.stack)
    }
}