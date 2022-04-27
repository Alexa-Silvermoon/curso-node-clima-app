
const fs = require('fs'); //para WriteFileSync es propio de javascript, es decir no es una libreria de terceros

const axios = require('axios');

class Busquedas {

    historial = [];
    
    dbPath = './db/database.json';

    constructor(){

        // this._historial;

        // aqui leer la db si existe
        this.leerDB();

    }

    get historialCapitalizado(){

        return this.historial.map( lugar => {

            let palabras = lugar.split(' ');//separa y convierte las palabras en arreglos

            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1) );
            //la palabra en la posicion 0, es decir la primera quedara en mayuscula p[0].toUpperCase()
            //substring(1) me traera el resto de letras excepto la de la posicion 0

            return palabras.join(' ');

        });

    }

    get paramsMapbox(){

        return{

            'access_token': process.env.MAPBOX_KEY, //mi llave en el archivo .env
            'limit': 5, //limita a traer los 5 resultados mas relevantes
            'language': 'es' // en español se veran los resultados

        }
    }

    async ciudad( lugar = '' ){ //me traera las primeras 5 ciudades que encuntre la API
        
        try {

            // PETECION HTTP

            const instance = axios.create({

                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,

                params: this.paramsMapbox

            });

            const resp = await instance.get();

            // console.log( 'Ciudad: ', lugar );
            // const resp = await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/cali.json?proximity=ip&types=place%2Cpostcode%2Caddress&language=es&access_token=pk.eyJ1IjoiYWxleGEtc2lsdmVybW9vbi05NSIsImEiOiJjbDI4MTJwbzcwMjltM2pwamk4Z3JxdDc5In0.stCV8k3JZ7-dramWge3tCQ');
            // const resp = await axios.get('https://reqres.in/api/users?page=2'); //verificar pruebas en postman
            
            return resp.data.features.map( lugar => ({ // ({}) regresa un objeto de forma implicita

                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0], // longitud
                lat: lugar.center[1] // latitud

            }));
            
            // console.log( resp.data.features ); //resp.data.features me mostrara la informacion de la ciudad pero como objeto
            // return[]; //retorna lugares que coincidan con el nombre de la ciudad

        } catch ( error ) {

            return[];

        }

    }

    get paramsOpenWeather(){

        return {

            // 'lon': lugar.center[0],
            // 'lat': lugar.center[1],
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'

        }

    }

    async climaLugar(lat = '', lon = ''){ //lat, lng ----- latitud, longitud

        try {

            // instance axios.create();
            const instance = axios.create({

                baseURL: `https://api.openweathermap.org/data/2.5/weather`,

                params: {...this.paramsOpenWeather, lat, lon}

            });

            // resp.data
            const resp = await instance.get();
            // console.log( resp ); //trae la informacion de la data y el main dentro de la data tanto en cmd como en postman

            const {weather, main} = resp.data;

            return {

                desc: weather[0].description, //clima es un arreglo en postman
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp

            }


        } catch ( error ){

            console.log( error );

        }

    }

    agregarHistorial( lugar = ''){

        // previene duplicados
        if ( this.historial.includes( lugar.toLocaleLowerCase() ) ){//si lugar existe en array historial

            return;

        }

        this.historial = this.historial.splice(0,4);
        //con eso solo mantendre las ultimas 5 busquedas en el historial

        this.historial.unshift( lugar.toLocaleLowerCase() ); //opcional haberlo hecho con .push()
        // se hizo con .ushift() porque graba en reversa, es decir que lo mas viejo va quedando mas atras

        // grabar en la DB
        this.guardarDB();

    }

    guardarDB(){

        const payLoad = {//por si en el futuro necesitara guardar mas cosas

            historial: this.historial

        };

        fs.writeFileSync( this.dbPath, JSON.stringify( payLoad ) );//convierte string a json

    }

    leerDB(){

        if ( !fs.existsSync( this.dbPath ) ){

            return null;

        }

        const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8'} );
        //encoding me evita bites
        // console.log(info);

        const data = JSON.parse( info );
        // JSON.parse( info ) info es un string y con parse se convierte a un arreglo
        // console.log( data );

        return this.historial = data.historial;

    }

}

module.exports = Busquedas;