import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
import * as firebaseHelper from 'firebase-functions-helper';
import * as express from 'express';
import * as bodyParser from "body-parser";
import * as cors from "cors";

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
const app = express();
const main = express();
const contactsCollection = 'turista';

main.use('/api/v1', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

// webApi is your functions name, and you will pass main as 
// a parameter
export const webApi = functions.https.onRequest(main);

interface Turista {
    firstName: String
    lastName: String
    img: String
    email: String
    reservaciones: any []
}

// Añadir nuevo Turista
app.post('/turista', async (req, res) => {
    try {
        const contact: Turista = {
            firstName: req.body['firstName'],
            lastName: req.body['lastName'],
            email: req.body['email'],
            img: req.body['img'],
            reservaciones: req.body['reservaciones']
        }
        const newDoc = await firebaseHelper.firestore
            .createNewDocument(db, contactsCollection, contact);
        res.status(201).send(`Nuevo turista Creado: ${newDoc.id}`);
    } catch (error) {
        res.status(400).send(`Ingresar todos los datos!!!`)
    }        
})
// Actualizar turista
app.patch('/turista/:turistaId', async (req, res) => {
    const updatedDoc = await firebaseHelper.firestore
        .updateDocument(db, contactsCollection, req.params.turistaId, req.body);
    res.status(204).send(`Actualizar nuevo turista: ${updatedDoc}`);
})
// Obtener un turista
app.get('/turista/:turistaId', (req, res) => {
    firebaseHelper.firestore
        .getDocument(db, contactsCollection, req.params.turistaId)
        .then(doc => res.status(200).send(doc))
        .catch(error => res.status(400).send(`No existe ese turista: ${error}`));
})
// Obtener todos los turistas
app.get('/turista', (req, res) => {
    firebaseHelper.firestore
        .backup(db, contactsCollection)
        .then(data => res.status(200).send(data))
        .catch(error => res.status(400).send(`No existen turistas: ${error}`));
})
// Delete a contact 
app.delete('/turista/:turistaId', async (req, res) => {
    const deletedContact = await firebaseHelper.firestore
        .deleteDocument(db, contactsCollection, req.params.turistaId);
    res.status(204).send(`Turista eliminado: ${deletedContact}`);
})

const options:cors.CorsOptions = {
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token"],
    credentials: true,
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
    origin: "https://soaapirest.firebaseapp.com/api/v1/turista",
    preflightContinue: false
  };

app.use(cors(options));
app.options("*", cors(options));
// {
//     // Set CORS headers for preflight requests
//     // Allows GETs from any origin with the Content-Type header
//     // and caches preflight response for 3600s
  
//     res.set('Access-Control-Allow-Origin', '*');
  
//     if (req.method === 'OPTIONS') {
//       // Send response to OPTIONS requests
//       res.set('Access-Control-Allow-Methods', 'GET');
//       res.set('Access-Control-Allow-Headers', 'Content-Type');
//       res.set('Access-Control-Max-Age', '3600');
//       res.status(204).send('');
//     } else {
//       res.send('Hello World!');
//     }
//   };

export { app };