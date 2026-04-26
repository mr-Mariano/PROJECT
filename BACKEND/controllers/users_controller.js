
export const login_user = (req, res) => {
    return res.status(200).json({ user : { email : 'Mariano', password : 'mariano'} })
}

export const register_user = (req, res) => {
    return res.status(201).json({
        message : "User Created Succesfully",
        user : {
            name : "MARIANO",
            email : "mariano@gmail.com",
            password : "mariano"
        }
    })
}