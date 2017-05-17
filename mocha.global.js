import app from './';
import mongoose from 'mongoose';

after(function(done) {
  app.grc.on('close', () => done());
  mongoose.connection.close();
  app.grc.close();
});
