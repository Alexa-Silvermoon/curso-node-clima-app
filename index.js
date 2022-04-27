
require('dotenv').config();
//Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env

const { leerInput, pausa, inquirerMenu, listarLugares } = require('./helpers/inquirer.js');
const Busquedas = require('./models/busquedas.js');

// console.log(process.env.MAPBOX_KEY); //hace referencia al archivo .env que es donde esta mi mapbox_key

const main = async() => {

    const busquedas = new Busquedas();

    let opt = '';

    // await pausa();

    do {

        opt = await inquirerMenu();
        console.log( {opt} );

        switch ( opt ) {

            case 1:

                // MOSTRAR MENSAJE
                const termino = await leerInput('Ciudad: ');
                // console.log( lugar );


                // BUSCAR LOS LUGARES
                const lugares = await busquedas.ciudad( termino );
                // console.log( lugares );


                // SELECCIONAR EL LUGAR
                const id = await listarLugares( lugares );
                //console.log({ id });
                if ( id === '0') continue; //para que nos salte error, y asi JS salta a la siguiente interaccion
                // '0' es cancelar en listarLugares

                const lugarSel = lugares.find( l => l.id === id );
                console.log( lugarSel );


                // GUARDAR EN DB
                busquedas.agregarHistorial( lugarSel.nombre );
    
                
                // CLIMA
                const clima = await busquedas.climaLugar( lugarSel.lat, lugarSel.lng );
                console.log({ clima });


                // MOSTRAR RESULTADOS
                console.clear();
                console.log( '\n Informacion de la Ciudad \n'.green );
                console.log('Ciudad: ', lugarSel.nombre.green);
                console.log('Latitud: ', lugarSel.lat);
                console.log('Longitud: ', lugarSel.lng);
                console.log('Temperatura: ', clima.temp);
                console.log('Temp Minima: ', clima.min);
                console.log('Temp Maxima: ', clima.max);
                console.log('El Clima esta: ', clima.desc.green);

            break;

            case 2:

                busquedas.historialCapitalizado.forEach( ( lugar, i ) => {

                    const idx = `${ i + 1}.`.green;

                    console.log(`${idx} ${lugar}`);

                });

            break;

        }

        await pausa();

    } while ( opt !== 0 );

}

main();

/*

https://www.npmjs.com/package/request

https://www.npmjs.com/package/fetch

https://www.npmjs.com/package/axios



Para pruebas rápidas del endpoint

https://reqres.in/

-----------------------------------------------

https://www.mapbox.com/

https://docs.mapbox.com/api/search/geocoding/

*/

