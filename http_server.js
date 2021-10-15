const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema, assertInputType } = require('graphql');
const app = express();
const low = require('lowdb');
const fs = require('lowdb/adapters/FileSync');
const adapter = new fs('db.json');
const db = low(adapter);
const cors = require('cors');


// allow cross-origin resource sharing (CORS)
app.use(cors());

// data parser - used to parse post data
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// serve static files from public directory
// -------------------------------------------
app.use(express.static('public'));

// init the data store
db.defaults({ users: [] }).write();

let port = process.env.PORT || 5000;

// return all users
app.get('/users', function (req, res) {
    res.send(db.get('users').value());
});
app.get('/forums', function (req, res) {
    res.send(db.get('forums').value());
});
app.get('/chats', function (req, res) {
    res.send(db.get('chats').value());
});
app.get('/coins', function (req, res) {
    res.send(db.get('coins').value());
});
app.get('/thumbnails', function (req, res) {
    res.send(db.get('thumbnails').value());
});
// add user
app.post('/addUser', function (req, res) {
    var user = {
        'id': req.body.id,
        'date': req.body.date,
        'email': req.body.email,
        'username': req.body.username,
        'password': req.body.password,
        'capital': req.body.capital,
        'coins': req.body.coins,
        'chats': req.body.chats,
        'threads': req.body.threads
    }
    db.set(`users.${user.id}`,user).write();
    console.log(db.get('users').value());
    res.send(db.get('users').value());
});

app.post('/addThread', function (req, res) {
    var thread = {
        'id': req.body.id,
        'date': req.body.date,
        'title': req.body.title,
        'topic': req.body.topic,
        'body': req.body.body,
        'author':req.body.author,
        'replies': req.body.replies
    }
    db.set(`forums.${thread.id}`,thread).write();
    console.log(db.get('forums').value());
    res.send(db.get('forums').value());
});

app.post('/addChat', function (req, res) {
    var chat = {
        'id': req.body.id,
        'date': req.body.date,
        'sender': req.body.sender,
        'receipient': req.body.receipient,
        'messages': req.body.messages

    }
    db.set(`chats.${chat.id}`,chat).write();
    console.log(db.get('chats').value());
    res.send(db.get('chats').value());
});

app.put('/editUser', function (req, res) {
    const { email, username, password, id } = req.body;
    db.get(`users.${id}`)
        .assign({ email:email, username:username, password:password })
        .write();
    res.send(db.get(`users.${id}`).value());
});

app.put('/editThread', function (req, res) {
    const { topic, title, body, author, id } = req.body;
    db.get(`forums.${id}`)
        .assign({ topic:topic, title:title, body:body, author:author })
        .write();
    res.send(db.get(`forums.${id}`).value());
});

app.put('/editChat', function (req, res) {
    const { sender, receipient, messages, id } = req.body;
    db.get(`chats.${id}`)
        .assign({ sender:sender, receipient:receipient, messages:messages })
        .write();
    res.send(db.get(`chats.${id}`).value());
});

app.delete('/removeUser', function (req, res) {
    const {  id } = req.body;
    db.get(`users`).unset(id).write();
    res.send(db.get(`users`).value());
});

app.delete('/removeThread', function (req, res) {
    const { id } = req.body;
    db.get(`forums`).unset(id).write();
    res.send(db.get(`forums.${id}`).value());
});

app.delete('/removeChat', function (req, res) {
    const { id } = req.body;
    db.get(`chats`).unset(id).write();
    res.send(db.get(`chats.${id}`).value());
});

var schema = buildSchema(`
type Query{
    user(id:String!) : user
    users : [user]
    userChat(userId: String!, chatId:String!) : userChat
    userChats : [userChat]
    userThread(userId: String!, threadId:String!) : userThread
    userThreads : [userThread]
    userCoin(userId: String!, coinId:String!) : userCoin
    userCoins : [userCoin]
    userTransaction(userId:String!, transId:String!) : transaction
    userTransactions(userId: String!) : [transaction]
    forum(id:String) : forum
    forums : [forum]
    thread(forumId:String, threadId:String) : thread
    chat(id:String) : chat
    chats : [chat]
    coin(id:String) : coin
    coins : [coin]
    thumbnail(id:String) : thumbnail
    thumbnails : [thumbnail]
    transaction(id:String) : transaction
    transactions : [transaction]  
},
type user{
    id : String
    username : String
    email : String
    password : String
    capital : Int
    coins : [userCoin]
    transactions : [transaction]
    chats : [userChat]
    threads : [userThreads]
}
type userThreads{
    created: [userThread]
    replies: [userThreadReply]
}
type userThread{
    threadId : String
}
type userThreadReply{
    threadId : String
    replyId : String
}
type userChat{
    id : String
    sender : String
    recipient : String
    messages : [message]
}
type message{
    id : String
    sender : String
    body : String
}
type userCoin{
    amount: Int
    history: [transaction]   
}
type transaction{
    id: String
    dateTime: String
    coinId: String
    coinAmount: Int
    currentCoinVal: Int
    fees: Int
}
type forum{
    id : String
    threads : [thread]
}
type thread{
    id : String
    author : String
    topic : String
    title : String
    body : String
    replies : [reply]
}
type reply{
    id : String
    threaId: String
    author : String
    body : String
}
type chat{
    id : String
    sender : String
    recipient : String
    messages : [message]
}

type coin{
    id : String
    name : String
    history : [priceUsd]   
}
type priceUsd {
    id: String!
    price : Int
    dateTime : String
}

type thumbnail{
    name : String
    link : String
}
input userInput{
    id : String
    username : String
    email : String
    password : String
    capital : Int
    coins : [coinInput]
    chats : [chatInput]
    threads : [threadInput]
}
input forumInput{
    id : String
    threads : [threadInput]
}
input threadInput{
    id : String
    author : String
    topic : String
    title : String
    body : String
    replies : [replyInput]
}
input replyInput{
    id : String
    threaId: String
    author : String
    body : String
}
input chatInput{
    id : String
    sender : String
    recipient : String
    messages : [messageInput]
}
input userChatInput{
    id : String
    sender : String
    recipient : String
    messages : [messageInput]
}
input messageInput{
    id : String
    sender : String
    body : String
}
input coinInput{
    id: String
}
input userCoinInput{
    id: String
    name: String
    amount: Int
    history: [transactionInput]   
}
input thumbnailInput{
    picLink : String
}
input userThreadInput{
    id : String
}
input userThreadReplyInput{
    threadId : String
    replyId : String
}
input priceUsdInput{
    price : Int
    dateTime : String 
}
input transactionInput{
    id: String
    dateTime: String
    coinId: String
    coinAmount: Int
    currentCoinVal: Int
    fees: Int
}
type deleteResponse{
    ok:Boolean
}
type Mutation{
    createUser(input: userInput) : user
    deleteUser(id:String!): deleteResponse
    editUserUsername(id:String!, username:String!) : user
    editUserEmail(id:String!, email:String!) : user
    editUserPassword(id:String!, password: String!) : user
    editUserCapital(id:String!, capital: Int!) : user
    createUserCoin(userId: String!, newCoin: userCoinInput!) : userCoin
    deleteUserCoin(userId: String!, coinId: String!) : deleteResponse
    editUserCoin(userId:String!, coinId: String!, amount: Int!, newTrans: transactionInput!) : userCoin
    createUserTransactions(userId: String!, newTrans: transactionInput!) : transaction
    deleteUserTransactions(userId: String!, transactionId: String!) : deleteResponse
    editUserTransactions(userId: String!, transactionId: String!, newTrans: transactionInput!) : transaction
    addUserChat(userId: String!, newChat: userChatInput!) : userChat
    deleteUserChat(userId: String!, chatId:String!): deleteResponse
    editUserChatMsg(userId: String!, chatId:String!, messageId: String!, newMessage: messageInput!) : message
    addUserChatMsg(userId: String!, chatId:String!, newMessage: messageInput!) : message
    deleteUserChatMsg(userId: String!, chatId:String!, messageId: String!): deleteResponse
    editUserThread(userId: String!, threadId:String!, newThread: userThreadInput) : userThread
    createUserThread(userId: String!, newThread: userThreadInput) : userThread
    deleteUserThread(userId: String!, threadId:String!): deleteResponse
    createUserThreadReply(userId: String!, threadId:String!, newReply: userThreadReplyInput) : userThreadReply
    deleteUserThreadReply(userId: String!, threadReplyId:String!): deleteResponse
    editUserThreadReply(userId: String!, threadReplyId:String!, newReply: userThreadReplyInput) : userThreadReply    
    createForum(input: forumInput) : forum
    deleteForum(id:String!): deleteResponse
    createThread(forumId: String!,input: threadInput) : thread
    deleteThread(forumId:String!, threadId: String!): deleteResponse
    editThread(forumId:String!, threadId: String!, input: threadInput) : thread
    createReply(userId: String!, threadId:String!, input: replyInput) : reply
    deleteReply(userId: String!, threadId:String!, replyId:String!): deleteResponse
    editReply(userId: String!, threadId:String!, replyId:String!) : reply
    createChat(input: chatInput) : chat
    deleteChat(id:String!): deleteResponse
    editChatMsg(chatId:String!, messageId: String!, newMessage: messageInput!) : message
    addChatMsg(chatId:String!, newChat: messageInput!) : message
    deleteChatMsg(chatId:String!, messageId: String!): deleteResponse
    createCoin(input: coinInput) : coin
    deleteCoin(id:String!): deleteResponse
    editCoinName(id:String!) : coin
    createPriceUsd(coinId: String!, input: priceUsdInput) : priceUsd
    deletePriceUsd(coinId: String!, priceId:String!): deleteResponse
    editPriceUsd(coinId: String!, priceId:String!, newPriceUsd: priceUsdInput) : priceUsd
    createThumbnail(input: thumbnailInput) : thumbnail
    deleteThumbnail(id:String!): deleteResponse
    editThumbnail(id:String!, newThumbnail: thumbnailInput) : thumbnail
}
`)
let filtered, index;
const arrIndexer = (arr,id)=>{
    clearVar()
    arr.map((item,i)=>{
        if(item.id === id){
            filtered = item
            index = i
        }
    })
}

clearVar = ()=>{
    index = null;
    filtered = null;
}

var root = {
    //Queries
    user : ({id})=>{
        let users = db.get('users').value()
        arrIndexer(users, id)
        return filtered
    },
    users : ()=> db.get('users').value(),
    createUser : ({input})=>{
        db.get('users').push(input).write()
        return input
    }, 
    userChat : ({userId, chatId})=> {
        let users = db.get('users').value()
        arrIndexer(users, userId)
        let chats = db.get(`users[${index}].chats`).values()
        arrIndexer(chats, chatId)
        return filtered
    },
    userChats : ({userId})=>{ 
        let users = db.get('users').value()
        arrIndexer(users, userId)
        return db.get(`users[${index}].chats`)
        },
    userThread : ({userId, threadId})=>{
        let users = db.get('users').value()
        arrIndexer(users, userId)
        let threads = db.get(`users[${index}].threads`).value()
        arrIndexer(threads,threadId)
        return filtered
    },
    userThreads : ({userId})=> {
        let users = db.get('users').value()
        arrIndexer(users, userId)
        return db.get(`users[${index}].threads`)
    },
    userCoin : ({userId, coinId})=>{
        let users = db.get('users').value()
        arrIndexer(users, userId)
        let coins = db.get(`users[${index}].coins`).value()
        arrIndexer(coins,coinId)
        return filtered
    },
    userCoins : ({userId})=> {
        let users = db.get('users').value()
        arrIndexer(users, userId)
        return db.get(`users[${index}].coins`)
    },
    userTransaction : ({userId, transId})=>{
        let users = db.get('users').value()
        arrIndexer(users, userId)
        let transactions = db.get(`users[${index}].transactions`).value()
        arrIndexer(transactions,transId)
        return filtered
    },
    userTransactions :({userId})=> {
        let users = db.get('users').value()
        arrIndexer(users, userId)
        return db.get(`users[${index}].transactions`)
    },
    forum : ({id})=>{
        let forums = db.get('forums').value()
        arrIndexer(forums, id)
        return filtered
    },
    forums : ()=> db.get('forums').value(),
    thread : ({forumId, threadId})=>{
        let forums = db.get('forums').value()
        arrIndexer(forums, forumId)
        let threads = db.get(`forums[${index}]`).values
        arrIndexer(threads, threadId)
        return filtered
    },
    chat : ({id})=>{
        let chats = db.get('chats').value()
        arrIndexer(chats, id)
        return filtered
    },
    chats : ()=>db.get('chats').value(),
    coin : ({id})=>{
        let coins = db.get('coins').value()
        arrIndexer(coins, id)
        return filtered
    },
    coins : ()=> db.get('coins').value(),
    thumbnail : ({id})=>{
        let thumbnails = db.get('thumbnails').value()
        arrIndexer(thumbnails, id)
        return filtered
    },
    thumbnails : ()=> db.get('thumbnails').value(),
    transaction : ({id})=>{
        let users = db.get('users').value()
        arrIndexer(users, id)
        return filtered
    },
    transactions : ()=> db.get('transcations').value(),  
    


    deleteUser: ({id})=>{
        let users = db.get('users').value()
        arrIndexer(users, id)
        const ok = Boolean(filtered)
        if(ok){
            db.get('users').splice(index,1).write()
        } 
        return {ok}
    },
    editUserUsername : ({id, username})=>{
        let users = db.get('users').value()
        arrIndexer(users, id)
        db.get(`users[${index}]`)
        .assign({username: username})
        .write()
        return db.get(`users[${index}]`).value()
    },
    editUserEmail : ({id, email})=>{
        let users = db.get('users').value()
        arrIndexer(users, id)
        db.get(`users[${index}]`)
        .assign({email: email})
        .write()
        return db.get(`users[${index}]`).value()
        
    },
    editUserPassword : ({id, password})=>{
        let users = db.get('users').value()
        arrIndexer(users, id)
        db.get(`users[${index}]`)
        .assign({password: password})
        .write()
        return db.get(`users[${index}]`).value()
        
    },
    editUserCapital : ({id, capital})=>{
        let users = db.get('users').value()
        arrIndexer(users, id)
        db.get(`users[${index}]`)
        .assign({capital: capital})
        .write()
        return db.get(`users[${index}]`).value()
        
    },
    createUserCoin : ({userId, newCoin})=>{
        //userId: String!, newCoin: userCoinInput!
        console.log("userCoin:",userId, newCoin)
        let users = db.get('users').value()
        arrIndexer(users, userId)
        db.get(`users[${index}].coins`).push(newCoin).write()
        return newCoin

    },
    deleteUserCoin : ({userId, coinId})=>{
        //userId: String!, coinId: String!
        console.log("userCoin:",userId, coinId)
        let users = db.get('users').value()
        arrIndexer(users, userId)
        let coins = db.get(`users[${index}].coins`).value()
        let oldIndex = index
        arrIndexer(coins, coinId)
        const ok = Boolean(filtered)
        db.get(`users[${oldIndex}].coins`).splice(index,1).write()
        return {ok}
    },
    editUserCoin : ({userId, coinId, amount, newTrans})=>{
        //userId:String!, coinId: String!, amount: Int!, newTrans: transactionInput!
        console.log("userCoin:",userId, coinId, amount, newTrans)
        let users = db.get('users').value()
        arrIndexer(users, userId)
        let coins = db.get(`users[${index}].coins`).value()
        let oldIndex = index
        arrIndexer(coins, coinId)
        let newAmount = filtered.amount + amount
        db.get(`users[${oldIndex}].coins[${index}]`)
            .assign({amount: newAmount})
            .write()
        db.get(`users[${oldIndex}].coins[${index}].history`)
            .push(newTrans)
            .write()
        return db.get(`users[${oldIndex}].coins[${index}]`)
    },
    createUserTransactions : ({userId, newTrans})=>{
        let users = db.get('users').value()
        arrIndexer(users, userId)
        db.get(`users[${index}].transactions`).push(newTrans).write()
        return newTrans
        
    },
    deleteUserTransactions : ({userId, transactionId})=>{
        let users = db.get('users').value()
        arrIndexer(users, userId)
        let transactions = db.get(`users[${index}].transactions`).value()
        let oldIndex = index
        arrIndexer(transactions, transactionId)
        const ok = Boolean(filtered)
        db.get(`users[${oldIndex}].transactions`).splice(index,1).write()
        return {ok}
        
    },
    editUserTransactions : ({userId, transactionId, newTrans})=>{
        let users = db.get('users').value()
        arrIndexer(users, userId)
        let transactions = db.get(`users[${index}].transactions`).value()
        let oldIndex = index
        arrIndexer(transactions, transactionId)
        const ok = Boolean(filtered)
        db.get(`users[${oldIndex}].transactions[${index}]`).splice(index,1,newTrans).write()
        return newTrans
        
    },
    addUserChat : ({userId, newChat})=>{
        let users = db.get('users').value()
        arrIndexer(users, userId)
        db.get(`users[${index}].chats`).push(newChat).write()
        return newChat
    },
    deleteUserChat: ({userId, chatId})=>{
        let users = db.get('users').value()
        arrIndexer(users, userId)
        let chats = db.get(`users[${index}].chats`).value()
        let oldIndex =index
        arrIndexer(chats,chatId)
        const ok = Boolean(filtered)
        db.get(`users[${oldIndex}].chats`).splice(index,1).write()
        return {ok}
    },
    editUserChatMsg : ({userId, chatId, messageId, newMessage})=>{
        let users = db.get('users').value()
        arrIndexer(users, userId)
        let chats = db.get(`users[${index}].chats`).value()
        let oldIndex =index
        arrIndexer(chats,chatId)
        let messages = db.get(`users[${oldIndex}].chats[${index}]`).value()
        let chatIndex = index
        arrIndexer(messages, messageId)
        db.get(`users[${oldIndex}].chats[${chatIdex}]`).splice(index,1,newMessage)
        return newMessage
    },
    addUserChatMsg : ({userId, chatId, newMessage})=>{
        let users = db.get('users').value()
        arrIndexer(users, userId)
        let chats = db.get(`users[${index}].chats`).value()
        let oldIndex =index
        arrIndexer(chats,chatId)
        db.get(`users[${oldIndex}].chats[${index}]`).push(newMessage).write()
        return newMessage
    },
    deleteUserChatMsg: ({userId, chatId, messageId})=>{
        let users = db.get('users').value()
        arrIndexer(users, userId)
        let chats = db.get(`users[${index}].chats`).value()
        let oldIndex =index
        arrIndexer(chats,chatId)
        let chatIndex = index
        arrIndexer(messages, messageId)
        const ok = Boolean(filtered)
        db.get(`users[${oldIndex}].chats[${chatIdex}]`).splice(index,1)
        return {ok}
    },
    editUserThread : ({userId, threadId, newThread})=>{
        let users = db.get('users').value()
        arrIndexer(users, userId)
        let threads = db.get(`users[${index}].threads.created`).value()
        let oldIndex =index
        arrIndexer(threads,threadId)
        let threadIndex = index
        arrIndexer(thread, messageId)
        db.get(`users[${oldIndex}].threads.created[${threadIndex}]`).splice(index,1,newThread).write()
        return newThread
        
    },
    createUserThread : ({userId, newThread})=>{
        let users = db.get('users').value()
        arrIndexer(users, userId)
        db.get(`users[${index}].threads.created`).push(newThread).write()
        return newThread
    },
    deleteUserThread: ({userId, threadId})=>{
        let users = db.get('users').value()
        arrIndexer(users, userId)
        let threads = db.get(`users[${index}].threads.created`).value()
        arrIndexer(threads,threadId)
        const ok = Boolean(filtered)
        db.get(`users[${oldIndex}].threads.created`).splice(index,1).write()
        return {ok}
    },
    createUserThreadReply : ({userId, newReply})=>{
        let users = db.get('users').value()
        arrIndexer(users, userId)
        db.get(`users[${index}].threads.replies`).push(newThread).write()
        return newReply
    },
    deleteUserThreadReply: ({userId, threadReplyId})=>{
        let users = db.get('users').value()
        arrIndexer(users, userId)
        let threads = db.get(`users[${index}].threads.replies`).value()
        arrIndexer(threads,threadReplyId)
        const ok = Boolean(filtered)
        db.get(`users[${oldIndex}].threads.replies`).splice(index,1).write()
        return {ok}
    },
    editUserThreadReply : ({userId,  threadReplyId, newReply})=>{
        let users = db.get('users').value()
        arrIndexer(users, userId)
        let threads = db.get(`users[${index}].threads.replies`).value()
        let oldIndex =index
        arrIndexer(threads,threadReplyId)
        db.get(`users[${oldIndex}].threads.created[${threadIndex}]`).splice(index,1,newReply).write()
        return newReply
    },
    createForum : ({input})=>{
        db.get('forums').push(input).write()
        return input
    },
    deleteForum: ({id})=>{
        let forums = db.get('forums').value()
        arrIndexer(forums, id)
        const ok = Boolean(filtered)
        db.get(`forums`).splice(index,1).write()
        return {ok}
    },
    createThread : ({forumId, input})=>{
        let forums = db.get('forums').value()
        arrIndexer(forums, forumId)
        db.get(`forums[${index}]`).push(input).write()
        return input
    },
    deleteThread: ({forumId, threadId})=>{
        let forums = db.get('forums').value()
        arrIndexer(forums, forumId)
        let threads = db.get(`forums[${index}]`).value()
        let oldIndex = index
        arrIndexer(threads,threadId)
        const ok = Boolean(filtered)
        db.get(`forums[${oldIndex}]`).splice(index,1).write()
        return {ok}
    },
    editThread : ({forumId, threadId, input})=>{
        let forums = db.get('forums').value()
        arrIndexer(forums, forumId)
        let threads = db.get(`forums[${index}]`).value()
        let oldIndex = index
        arrIndexer(threads,threadId)
        db.get(`forums[${oldIndex}]`).splice(index,1, input).write()
        return input
    },
    createReply : ({forumId, threadId, input})=>{
        let forums = db.get('forums').value()
        arrIndexer(forums, forumId)
        let threads = db.get(`forums[${index}]`).value()
        let oldIndex = index
        arrIndexer(threads,threadId)
        db.get(`forums[${oldIndex}].threads[${index}].replies`).push(input).write()
        return input
    },
    deleteReply: ({forumId, threadId, replyId})=>{
        let forums = db.get('forums').value()
        arrIndexer(forums, forumId)
        let threads = db.get(`forums[${index}]`).value()
        let oldIndex = index
        arrIndexer(threads,threadId)
        let threadIndex = index
        arrIndexer(replies,replyId)
        const ok = Boolean(filtered)
        db.get(`forums[${oldIndex}.threads[${threadIndex}].replies`).splice(index,1).write()
        return {ok}
    },
    editReply : ({forumId, threadId, replyId, input})=>{
        let forums = db.get('forums').value()
        arrIndexer(forums, forumId)
        let threads = db.get(`forums[${index}]`).value()
        let oldIndex = index
        arrIndexer(threads,threadId)
        let threadIndex = index
        arrIndexer(replies,replyId)
        db.get(`forums[${oldIndex}.threads[${threadIndex}].replies`).splice(index,1, input).write()
        return input
    },
    createChat : ({input})=>{
        db.get('chats').push(input).write()
        return input
    },
    deleteChat: ({id})=>{
        let chats = db.get('chats').value()
        arrIndexer(chats, id)
        const ok = Boolean(filtered)
        db.get(`chats`).splice(index,1).write()
        return {ok}
    },
    editChatMsg : ({chatId, messageId, newMessage})=>{
        let chats = db.get('chats').value()
        arrIndexer(chats, chatId)
        let messages = db.get(`chats[${index}].messages`).value()
        arrIndexer(messages, messageId)
        db.get(`chats[${index}].messages`).splice(index,1,newMessage).write()
        return newMessage
    },
    addChatMsg : ({chatId, newChat})=>{
        let chats = db.get('chats').value()
        arrIndexer(chats, chatId)
        db.get(`chats[${index}].messages`).push(newChat).write()
        return newChat
    },
    deleteChatMsg: ({chatId, messageId})=>{
        let chats = db.get('chats').value()
        arrIndexer(chats, chatId)
        let messages = db.get(`chats[${index}].messages`).value()
        arrIndexer(messages, messageId)
        const ok = Boolean(filtered)
        db.get(`chats[${index}].messages`).splice(index,1).write()
        return {ok}
    },
    createCoin : ({input})=>{
        db.get('coins').push(input).write()
        return input
    },
    deleteCoin: ({id})=>{
        let coins = db.get('coins').value()
        arrIndexer(coins, id)
        const ok = Boolean(filtered)
        db.get('coins').splice(index,1).write()
        return {ok}
    },
    editCoinName : ({id, newName})=>{
        let coins = db.get('coins').value()
        arrIndexer(coins, id)
        db.get(`coins[${index}]`)
        .assign({name: newName})
        .write()
        return db.get(`coins[${index}].name`).value()
    },
    createPriceUsd : ({coinId, input})=>{
        let coins = db.get('coins').value()
        arrIndexer(coins, coinId)
        db.get(`coins[${index}].history`).push(input).wrie()
        return input
    },
    deletePriceUsd: ({coinId, priceId})=>{
        let coins = db.get('coins').value()
        arrIndexer(coins, coinId)
        let history = db.get(`coins[${index}].history`).value()
        let oldIndex = index
        arrIndexer(history, priceId)
        const ok = Boolean(filtered)
        db.get(`coins[${oldIndex}].history`).splice(index,1).write()
        return {ok}
    },
    editPriceUsd : ({coinId, priceId, newPriceUsd})=>{
        let coins = db.get('coins').value()
        arrIndexer(coins, coinId)
        let history = db.get(`coins[${index}].history`).value()
        let oldIndex = index
        arrIndexer(history, priceId)
        db.get(`coins[${oldIndex}].history`).splice(index,1, newPriceUsd).write()
        return newPriceUsd
    },
    createThumbnail : ({input})=>{
        db.get('thumbnails').push(input).write()
        return input
    },
    deleteThumbnail: ({id})=>{
        let thumbnails = db.get('thumbnails').value()
        arrIndexer(thumbnails, id)
        const ok = Boolean(filtered)
        db.get('thumbnails').splice(index,1).write()
        return {ok}
    },
    editThumbnail : ({id, newThumbnail})=>{
        let thumbnails = db.get('thumbnails').value()
        arrIndexer(thumbnails, id)
        db.get('thumbnails').splice(index,1, newThumbnail).write()
        return newThumbnail
    },

}
// start server
// -----------------------
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(port, function () {
    console.log(`Running on port ${port}`);
});
