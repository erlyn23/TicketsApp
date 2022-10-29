// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyA1d1ZjrTpY-gbbrOzjphM7u5furLH7nrQ",
    authDomain: "miturnitord-a5afd.firebaseapp.com",
    databaseURL: "https://miturnitord-a5afd-default-rtdb.firebaseio.com",
    projectId: "miturnitord-a5afd",
    storageBucket: "miturnitord-a5afd.appspot.com",
    messagingSenderId: "1066585980356",
    appId: "1:1066585980356:web:d0e5ce67f4e58d04097891"
  },
  firebaseConfigProd:{
    apiKey: "AIzaSyC7ObVf0qluPJFUWnu6UFJ8UDeIdUvggmk",
    authDomain: "tuturnord-85d8f.firebaseapp.com",
    projectId: "tuturnord-85d8f",
    storageBucket: "tuturnord-85d8f.appspot.com",
    messagingSenderId: "899090511952",
    appId: "1:899090511952:web:8024c9140df54a3d943955"
  },
  firebaseConfigDev: {
    apiKey: "AIzaSyB6KtrgvmtEK26U2UJXozgq89V6Bsyv3FE",
    authDomain: "tuturnorddev.firebaseapp.com",
    projectId: "tuturnorddev",
    storageBucket: "tuturnorddev.appspot.com",
    messagingSenderId: "211210531678",
    appId: "1:211210531678:web:0e59e05f891a5f25a755cf"
  },
  mapToken: 'pk.eyJ1IjoiZXJseW4yMyIsImEiOiJja2Q4NnFtYmkwMW5jMzRzZ3N0aTEwZWEzIn0.cO65NFyyEyHN8OSn-9uNYw',
  clientId: '1066585980356-ce1gmva74c90bda3p03ce8g9ru81cjto.apps.googleusercontent.com',
  clientIdProd: '899090511952-9aj6oat14qeij7tcetg9tho7agluo95p.apps.googleusercontent.com',
  sendMail: 'https://tuturnord.herokuapp.com/api/send-problem'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
