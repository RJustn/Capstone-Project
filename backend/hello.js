const helloworld = async (req, res) => {
    res.json({ message: "Hello from API!" });
}

module.exports = {helloworld};