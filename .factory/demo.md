# Demo sandbox

Open <https://bike-service-receipts.sociobot.in/?demo=1> or `/demo`.

The sample opens immediately with two bikes, four service receipts, recorded costs and odometers, and three reminders. CSV, PDF, and JSON exports work from the sample.

Demo records use the separate IndexedDB database `demo:bike-service-receipts`. Its bike selection uses the `demo:selectedBikeId` localStorage key. Demo mode never opens the real `bike-service-receipts` database or its selected-bike key.

Use **Reset demo** to restore the original sample. Use **Start for real** to clear the demo database and open the real local log.
