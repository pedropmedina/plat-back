const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Conversation = require('../conversation/conversation.model');
const Request = require('../request/request.model');
const { User } = require('../user/user.model');

const planSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: Schema.Types.ObjectId, ref: 'Pin', required: true },
    date: { type: Schema.Types.Date, required: true },
    invites: [{ type: Schema.Types.ObjectId, ref: 'Request' }],
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    chat: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    media: [String],
    private: { type: Boolean, default: false },
    author: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

planSchema.pre('remove', async function() {
  await Conversation.findOneAndDelete({ plan: this._id }).exec();
  return await Request.deleteMany({ plan: this._id }).exec();
});

// create a request for each user in the invites array
planSchema.pre('save', async function() {
  // find the author of the request to push request id into corresponding array
  const author = await User.findById(this.author).exec();

  for (let inviteeId of this.invites) {
    // instantiate new request and persist in db
    const req = await new Request({
      to: inviteeId,
      reqType: 'INVITE',
      plan: this._id,
      author: this.author
    }).save();
    // find each user to whom request has been made and push request into receivedRequest array
    const invitee = await User.findById(inviteeId).exec();
    invitee.receivedRequests.push(req._id);
    await invitee.save();

    // push and save request into author's sentRequests array
    author.sentRequests.push(req._id);
    await author.save();
  }
});

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
