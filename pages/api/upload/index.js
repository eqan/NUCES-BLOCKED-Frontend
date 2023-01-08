export default function importfile(req ,res){
  
    res.status(200).send('CSV file processing started');
  }
  
  export const config = {
      api: {
        bodyParser: true,
      },
    };