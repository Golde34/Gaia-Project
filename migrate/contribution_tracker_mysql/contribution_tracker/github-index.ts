import express, { Application, Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { fetchCommits, getCommits } from './src/infrastructure/get-total-commit.service';
import { read } from 'fs';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3003;

app.get('/', async (req: Request, res: Response) => {
    await fetchCommits();
    const results = await getCommits();
    res.send(results);
})


app.listen(port, () => {
    console.log(`Server s Fire at port ${port}`);
})