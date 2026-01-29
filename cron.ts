import cron from 'node-cron';
import { runDataUpdatePipeline } from './functions';

export function registerCronJobs() {
  cron.schedule('0 0 * * * *', async () => {
    await runDataUpdatePipeline();
  });

//   cron.schedule('* * * * * *', async () => {
//     console.log('Hello world');
//   });
}
