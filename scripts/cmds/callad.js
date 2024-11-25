const { getStreamsFromAttachment, log } = global.utils;

const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];


module.exports = {

    config: {

        name: "callad",

        version: "1.7",

        author: "NTKhang",

        countDown: 5,

        role: 0,

        description: {

            vi: "gửi báo cáo, góp ý, báo lỗi,... của bạn về admin bot",

            en: "send report, feedback, bug,... to admin bot"

        },

        category: "contacts admin",

        guide: {

            vi: "   {pn} <tin nhắn>",

            en: "   {pn} <message>"

        }

    },


    langs: {

        vi: {

            missingMessage: "Vui lòng nhập tin nhắn bạn muốn gửi về admin",

            sendByGroup: "\n- Được gửi từ nhóm: %1\n- Thread ID: %2",

            sendByUser: "\n- Được gửi từ người dùng",

            content: "\n\nNội dung:\n─────────────────\n%1\n─────────────────\nPhản hồi tin nhắn này để gửi tin nhắn về người dùng",

            success: "Đã gửi tin nhắn của bạn về nhóm chat thành công!\n",

            failed: "Đã có lỗi xảy ra khi gửi tin nhắn của bạn về nhóm chat\nKiểm tra console để biết thêm chi tiết",

            reply: "📍 Phản hồi từ admin:\n─────────────────\n%1\n─────────────────\nPhản hồi tin nhắn này để tiếp tục gửi tin nhắn về admin",

            replySuccess: "Đã gửi phản hồi của bạn về admin thành công!",

            feedback: "📝 Phản hồi từ người dùng %1:\n- User ID: %2%3\n\nNội dung:\n─────────────────\n%4\n─────────────────\nPhản hồi tin nhắn này để gửi tin nhắn về người dùng",

            replyUserSuccess: "Đã gửi phản hồi của bạn về người dùng thành công!",

            noAdmin: "Hiện tại bot chưa có admin nào"

        },

        en: {

            missingMessage: "Please enter the message you want to send to admin",

            sendByGroup: "\n- Sent from group: %1\n- Thread ID: %2",

            sendByUser: "\n- Sent from user",

            content: "\n\nContent:\n─────────────────\n%1\n─────────────────\nReply this message to send message to user",

            success: "Sent your message to the group chat successfully!\n",

            failed: "An error occurred while sending your message to the group chat\nCheck console for more details",

            reply: "📍 Reply from admin:\n═════════════════\n Admin are unable to Reply with this command so they will join this Group and Help you out👀Thanks 💐\n═════════════════ \n Wait for Admins joins your group💐",

            replySuccess: "Sent your reply to admin successfully!",


            feedback: "📝 Feedback from user %1:\n- User ID: %2%3\n\nContent:\n─────────────────\n%4\n─────────────────\nReply this message to send message to user",

            replyUserSuccess: "Sent your reply to the user successfully!",

            noAdmin: "Bot has no admin at the moment"

        }

    },


    onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {

        const { senderID, threadID, isGroup } = event;

        if (!args[0])

            return message.reply(getLang("missingMessage"));


        const senderName = await usersData.getName(senderID);

        const msg = "==📨 CALL ADMIN 📨=="

            + `\n- User Name: ${senderName}`

            + `\n- User ID: ${senderID}`

            + (isGroup ? getLang("sendByGroup", (await threadsData.get(threadID)).threadName, threadID) : getLang("sendByUser"));


        const formMessage = {

            body: msg + getLang("content", args.join(" ")),

            mentions: [{

                id: senderID,

                tag: senderName

            }],

            attachment: await getStreamsFromAttachment(

                [...event.attachments, ...(event.messageReply?.attachments || [])]

                    .filter(item => mediaTypes.includes(item.type))

            )

        };


        try {

            const messageSend = await api.sendMessage(formMessage, "8170366536363395"); // Replace with Google Chat tid

            global.GoatBot.onReply.set(messageSend.messageID, {

                commandName,

                messageID: messageSend.messageID,

                threadID,

                messageIDSender: event.messageID,

                type: "userCallAdmin"

            });

            message.reply(getLang("success"));

        } catch (err) {

            message.reply(getLang("failed"));

            log.err("CALL ADMIN", err);

        }

    },


    onReply: async ({ args, event, api, message, Reply, usersData, commandName, getLang }) => {

        const { type, threadID, messageIDSender } = Reply;

        const senderName = await usersData.getName(event.senderID);

        const { isGroup } = event;


        switch (type) {

            case "userCallAdmin": {

                const formMessage = {

                    body: getLang("reply", senderName, args.join(" ")),

                    mentions: [{

                        id: event.senderID,

                        tag: senderName

                    }],

                    attachment: await getStreamsFromAttachment(

                        event.attachments.filter(item => mediaTypes.includes(item.type))

                    )

                };


                api.sendMessage(formMessage, threadID, (err, info) => {

                    if (err)

                        return message.err(err);

                    message.reply(getLang("replyUserSuccess"));

                    global.GoatBot.onReply.set(info.messageID, {

                        commandName,

                        messageID: info.messageID,

                        messageIDSender: event.messageID,

                        threadID: event.threadID,

                        type: "adminReply"

                    });

                }, messageIDSender);

                break;

            }

            case "adminReply": {

                let sendByGroup = "";

                if (isGroup) {

                    const { threadName } = await api.getThreadInfo(event.threadID);

                    sendByGroup = getLang("sendByGroup", threadName, event.threadID);

                }

                const formMessage = {

                    body: getLang("feedback", senderName, event.senderID, sendByGroup, args.join(" ")),

                    mentions: [{

                        id: event.senderID,

                        tag: senderName

                    }],

                    attachment: await getStreamsFromAttachment(

                        event.attachments.filter(item => mediaTypes.includes(item.type))

                    )

                };


                api.sendMessage(formMessage, threadID, (err, info) => {

                    if (err)

                        return message.err(err);

                    message.reply(getLang("replySuccess"));

                    global.GoatBot.onReply.set(info.messageID, {

                        commandName,

                        messageID: info.messageID,

                        messageIDSender: event.messageID,

                        threadID: event.threadID,

                        type: "userCallAdmin"

                    });

                }, messageIDSender);

                break;

            }

            default: {

                break;

            }

        }

    }

};
