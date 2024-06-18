function generateInviteRef() {
    return Math.random().toString(36).substr(2, 12).padEnd(12, '0');
}

module.exports = generateInviteRef;
