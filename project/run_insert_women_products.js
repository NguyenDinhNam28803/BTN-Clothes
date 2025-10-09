import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function runSqlFile() {
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('./insert_women_products.sql', 'utf8');
    
    // Split by ; to get individual SQL statements
    const sqlStatements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${sqlStatements.length} SQL statements to execute`);
    
    // Execute each SQL statement
    for (let i = 0; i < sqlStatements.length; i++) {
      const sql = sqlStatements[i];
      
      if (sql.toLowerCase().startsWith('select')) {
        console.log(`Executing query #${i + 1}: ${sql.substring(0, 50)}...`);
        const { data, error } = await supabase.rpc('pgaudit.exec_sql', { 
          query_text: sql
        });
        
        if (error) {
          console.error(`Error executing statement #${i + 1}:`, error);
        } else {
          console.log(`Results for query #${i + 1}:`, data);
        }
      } else {
        console.log(`Executing statement #${i + 1}: ${sql.substring(0, 50)}...`);
        const { error } = await supabase.rpc('pgaudit.exec_sql', { 
          query_text: sql
        });
        
        if (error) {
          console.error(`Error executing statement #${i + 1}:`, error);
        } else {
          console.log(`Successfully executed statement #${i + 1}`);
        }
      }
    }
    
    console.log('SQL file execution completed');
  } catch (error) {
    console.error('Error running SQL file:', error);
  }
}

runSqlFile();