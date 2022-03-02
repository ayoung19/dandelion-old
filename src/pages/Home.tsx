import React, { FC, useEffect, useState } from "react";
import { Wish } from "../store/types";
import { EuiBasicTable, EuiBasicTableColumn } from "@elastic/eui";
import { useAppSelector, useAuthFetch } from "../utils";
import { WishForm } from "../components/WishForm";

export const Home: FC = () => {
  const user = useAppSelector((state) => state.user);
  const AuthFetch = useAuthFetch();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Wish> | undefined>(undefined);

  useEffect(() => {
    AuthFetch("GET", "/api/users");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log(user?.wishes);

  const columns: EuiBasicTableColumn<Wish>[] = [
    {
      field: "url",
      name: "URL",
      sortable: true,
    },
    {
      name: "Actions",
      actions: [
        {
          name: "Edit",
          description: "Edit",
          icon: "pencil",
          type: "icon",
          color: "warning",
          onClick: (wish: Wish) => {
            setEditing(wish);
          },
        },
        {
          name: "Delete",
          description: "Delete",
          icon: "trash",
          type: "icon",
          color: "danger",
          onClick: (wish: Wish) => {
            AuthFetch("DELETE", `/api/wishes/${wish.id}`);
          },
        },
      ],
    },
  ];

  return (
    <>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <EuiBasicTable
        columns={columns}
        items={(user?.wishes || []).filter((wish) =>
          JSON.stringify(wish).includes(search)
        )}
        hasActions={true}
      />
      {editing && <WishForm initialValues={editing} setEditing={setEditing} />}
      <button onClick={() => setEditing({})}>new</button>
    </>
  );
};
