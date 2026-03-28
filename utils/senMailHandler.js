const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false, 
    auth: {
        user: "b655fc77aa9995", // Username từ ảnh bạn chụp
        pass: "b2e2637623a853", // Click icon con mắt trên Mailtrap để lấy
    },
});

module.exports = {
    sendMail: async function (to, password) {
        await transporter.sendMail({
            from: '"Hệ thống Admin" <admin@hutech.edu.vn>',
            to: to,
            subject: "Thông tin tài khoản mới",
            text: `Mật khẩu đăng nhập của bạn là: ${password}`,
            html: `<h3>Chào mừng thành viên mới!</h3>
                   <p>Mật khẩu đăng nhập hệ thống của bạn là: <b>${password}</b></p>`,
        });
    }
}