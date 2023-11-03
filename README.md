## task-manager (wip)

Trello-like task-manager web application built with MERN stack and Socket.io (come with drag and drop lists/cards, chats,...).

> Shout out to Trello - my favorite tool, I use it for every project I make. I want to build a web application like it but modify some stuff to fit my taste.

![Board Screenshot](./media/screenshot1.png)

---

### Quickstart

1. Clone this repo
2. Create database in mongodb (with your_database_name)
3. At `server` folder - create `.env` file with content like the example below
    ```
    PORT=3001
    ACCESS_TOKEN=secretaccesstoken
    REFRESH_TOKEN=secretrefreshtoken

    # make sure <your_database_name> matches your database name in mongodb
    DB_CONNECTION=mongodb://127.0.0.1:27017/<your_database_name>
    ```
4. Install packages and run command at 3 folders: server, client, socket
   ```bash
   # cd server
   npm install
   npm run dev

   # cd client
   npm install
   npm run dev

   # cd socket
   npm install
   npm run dev
   ```
5. Open http://localhost:5173/
