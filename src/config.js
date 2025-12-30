import  {createClient} from 'https://esm.sh/@supabase/supabase-js'



const supUrl = 'https://stphqutagbuzspeobzri.supabase.co'
const supKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cGhxdXRhZ2J1enNwZW9ienJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwODQ1ODQsImV4cCI6MjA4MjY2MDU4NH0.5VmvQULU0y1hNTwJ3CMTHnVI0hYV1EkJ7oioVbeExuI'

//intialize
const client = createClient(supUrl,supKey)

console.log(client);

export default client;