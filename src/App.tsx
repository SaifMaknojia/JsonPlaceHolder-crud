import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import apiClient, { CanceledError } from "./services/api-client";

interface User {
  id: number;
  name: string;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddUser = () => {
    const originalUser = [...users];
    const newUser = {
      id: Date.now(),
      name: "Saif",
    };
    setUsers([newUser, ...users]);
    apiClient
      .post(`/users`, newUser)
      .then((res) => setUsers([res.data, ...users]))
      .catch((err) => {
        setError(err.message);
        setUsers(originalUser);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    apiClient
      .get<User[]>("/users", {
        signal: controller.signal,
      })
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof CanceledError) return;
        setError(err.message);
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const handleDelete = (user: User) => {
    const originalArray = [...users];
    setUsers(users.filter((u) => user.id !== u.id));
    apiClient.delete(`/users/${user.id}`).catch((err) => {
      setUsers(originalArray);
      setError(err.message);
    });
  };
  const handleUpdate = (user: User) => {
    const originalUser = [...users];
    const updateUser = { ...user, name: "Saif Maknojia!" };
    setUsers(users.map((u) => (u.id === user.id ? updateUser : u)));
    apiClient.patch(`/users/${user.id}`, updateUser).catch((err) => {
      setError(err.message);
      setUsers(originalUser);
    });
  };

  return (
    <>
      {error && <p className="text-danger">{error}</p>}
      {loading && <div className="spinner-border"></div>}
      <button onClick={handleAddUser} className="btn btn-primary mb-3">
        Add
      </button>
      <ul className="list-group">
        {users.map((user) => {
          return (
            <li
              className="list-group-item  d-flex justify-content-between"
              key={user.id}
            >
              {user.name}
              <div>
                <button
                  onClick={() => handleUpdate(user)}
                  className="btn btn-outline-secondary"
                >
                  Update
                </button>{" "}
                <button
                  onClick={() => handleDelete(user)}
                  className="btn btn-outline-danger"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default App;
