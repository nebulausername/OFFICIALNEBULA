import pg from 'pg';
const { Client } = pg;

// Using the Direct Database Connection with new password
const connectionString = 'postgresql://postgres:HEkuAqgImA1OTwlR@db.vohqlxprlznmoiszakje.supabase.co:5432/postgres';

const client = new Client({
    connectionString: connectionString,
});

console.log(`Testing connection to: ${connectionString.replace(/:[^:@]*@/, ':****@')} ...`);

client.connect()
    .then(() => {
        console.log('✅ Connected successfully to Supabase!');
        return client.end();
    })
    .catch(err => {
        console.error('❌ Connection error:', err.message);
        if (err.message.includes('password')) console.error('Hint: Check the password.');
        if (err.message.includes('addr')) console.error('Hint: Check the host address.');
        return client.end();
    });
