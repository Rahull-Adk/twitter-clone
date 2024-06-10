const signup = async (req, res) => {
  res.post({
    data: "you hit the signup endpoint",
  });
};
const login = async (req, res) => {
  res.post({
    data: "you hit the login endpoint",
  });
};
const logout = async (req, res) => {
  res.post({
    data: "you hit the logout endpoint",
  });
};

export { signup, login, logout };
