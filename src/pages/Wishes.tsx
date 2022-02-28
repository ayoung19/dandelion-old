import React, { FC, useEffect, useState } from "react";
import { Toasts } from "../components/Toasts";
import { useAppSelector, useAuthFetch } from "../utils";

export const Wishes: FC = () => {
  const user = useAppSelector((state) => state.user);
  const { AuthFetch } = useAuthFetch();
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    AuthFetch("GET", "/api/users");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Toasts />
      {user?.wishes.map((wish) => (
        <div key={wish.id}>
          <span>{wish.url}</span>
          <button onClick={() => AuthFetch("DELETE", `/api/wishes/${wish.id}`)}>
            delete
          </button>
        </div>
      ))}
      <input value={url} onChange={(e) => setUrl(e.target.value)} />
      <button
        onClick={() =>
          AuthFetch("POST", "/api/wishes", JSON.stringify({ url: url }))
        }
      >
        add
      </button>
      {user?.following.map((f) => (
        <div>
          <button onClick={() => AuthFetch("GET", `/api/users/${f}`)}>
            {f}
          </button>
          <button onClick={() => AuthFetch("DELETE", `/api/following/${f}`)}>
            delete
          </button>
        </div>
      ))}
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button
        onClick={() =>
          AuthFetch("POST", "/api/following", JSON.stringify({ _id: email }))
        }
      >
        follow
      </button>
    </div>
  );
};
