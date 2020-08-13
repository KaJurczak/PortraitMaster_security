const Photo = require('../models/photo.model');
const Voter = require('../models/voter.model');
const requestIp = require('request-ip');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    if(title && author && email && file) { // if fields are not empty...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0]; // cut extension
      if(title.length <= 25 && author.length <= 50 && (fileExt == 'gif' || fileExt == 'jpg' || fileExt == 'png')){

        let isHTML = RegExp.prototype.test.bind(/(<([^>]+)>)/i);
        let isEmail = RegExp.prototype.test.bind(/^\S+@\S+\.\S+$/);
        if(isHTML(title) === false && isEmail(email) === true){
          const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
          await newPhoto.save(); // ...save new photo in DB
          res.json(newPhoto);
      }}

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    const clientIp = requestIp.getClientIp(req);
    const existingVoter = await Voter.findOne({ user: clientIp });
    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else if(!existingVoter){
      newVoter = new Voter({ user: clientIp, votes: req.params.id });
      await newVoter.save(); // ...save new vouter in DB
      res.json(newVoter);
      photoToUpdate.votes++;
      photoToUpdate.save();
      console.log('New voter was added');
    }
    else {
      if(existingVoter.votes.includes(photoToUpdate._id)){
        res.send('You can vote only once for this photo');
        console.log('You can vote only once for this photo');
      } else { 
        existingVoter.votes.push(photoToUpdate._id)
        existingVoter.save();
        photoToUpdate.votes++;
        photoToUpdate.save();
        console.log('vote was added to voter');
        res.send({ message: 'OK, vote was added' });
      }
    }
  } catch(err) {
    res.status(500).json(err);
  }

};
