import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
    projectId: "abracodopai-18383",
    appId: "1:150892835100:web:f2b07b90f1e6e0c1290ad9",
    storageBucket: "abracodopai-18383.firebasestorage.app",
    apiKey: "AIzaSyCw9Ts0OgCqdnrLA4cdTXPmByXEqfa46bM",
    authDomain: "abracodopai-18383.firebaseapp.com",
    messagingSenderId: "150892835100",
    measurementId: "G-3G3X574JHS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
    try {
        console.log("Reading novenasData.json...");
        // Explicitly read as UTF-8
        const jsonPath = path.join(__dirname, '../public/novenasData.json');
        const fileContent = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(fileContent);

        console.log(`Found ${data.length} novenas to migrate.`);

        let count = 0;
        for (const item of data) {
            const { image, ...cleanItem } = item;

            // Log the title to verify encoding in console
            if (count < 3) console.log(`Sample: ${cleanItem.title}`);

            await setDoc(doc(db, "novena_catalog", item.id), cleanItem);
            count++;

            if (count % 5 === 0) {
                process.stdout.write(`Synced ${count}/${data.length}\r`);
            }
        }

        console.log(`\n\nMIGRATION COMPLETE: ${count} items synced successfully.`);
        console.log("You can now refresh the app.");
        process.exit(0);
    } catch (e) {
        console.error("\nERROR during migration:", e);
        process.exit(1);
    }
}

migrate();
