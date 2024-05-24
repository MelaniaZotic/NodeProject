const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/nodeApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));
