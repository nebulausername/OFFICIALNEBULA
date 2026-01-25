import pg from 'pg';
const { Client } = pg;

// Using the AWS Pooler Host on Port 5432 (Direct Mode) as per user metadata
const connectionString = 'postgres://postgres.vohqlxprlznmoiszakje:1SoiZy3R9KTYlNxp@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require';

const client = new Client({
    connectionString: connectionString,
});

console.log(`Testing connection to: ${connectionString.replace(/:[^:@]*@/, ':****@')} ...`);

client.connect()
    .then(() => {
        console.log('✅ Connected successfully to Supabase (AWS Host)!');
        return client.end();
    })
    .catch(err => {
        console.error('❌ Connection error:', err.message);
        if (err.message.includes('password')) console.error('Hint: Check the password.');
        if (err.message.includes('addr')) console.error('Hint: Check the host address.');
        return client.end();
    });
