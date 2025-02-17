

const isAuth  =  (req, res, next) => {
  
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
        }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(!decoded){
        res.status(401).json({ message: 'Not authorized, token failed' });
      }
  
    req.user = decoded 
    next();
  
    
  };


  module.exports = isAuth;
  