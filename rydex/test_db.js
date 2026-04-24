const mongoose = require('mongoose');
mongoose.connect('mongodb://akarshsrivastava322_db_user:QEF7IsLocTyWzoxx@ac-txa7hpo-shard-00-00.glu9nti.mongodb.net:27017,ac-txa7hpo-shard-00-01.glu9nti.mongodb.net:27017,ac-txa7hpo-shard-00-02.glu9nti.mongodb.net:27017/?ssl=true&replicaSet=atlas-vtfv3m-shard-0&authSource=admin&retryWrites=true&w=majority');
const userSchema = new mongoose.Schema({ email: String, role: String });
const User = mongoose.model('User', userSchema, 'users');
async function run() {
  const users = await User.find({}).limit(10);
  console.log(users);
  process.exit(0);
}
run();
