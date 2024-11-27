import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import axios from "axios";
import { socket } from "@/socket";

export default createStore({
  state: {
    loading: false,
    user: null,
    usersConnected: [],
    activeRoom: null,
    chatRooms: {},
    userChatActive: null,
  },
  mutations: {
    setLoading(state, isLoading) {
      state.loading = isLoading;
    },
    setUser(state, user) {
      state.user = user;
    },
    setUsersConnected(state, users) {
      state.usersConnected = users;
    },
    setActiveRoom(state, room) {
      state.activeRoom = room;
    },
    addMessageToRoom(state, { room, message }) {
      if (state.activeRoom !== room) return;

      if (!state.chatRooms[room]) {
        state.chatRooms[room] = [];
      }

      state.chatRooms[room].push(message);
    },
    setChatRoomMessages(state, { room, messages }) {
      state.chatRooms[room] = messages;
    },
    setUserChatActive(state, user) {
      state.userChatActive = user;
    },
  },
  actions: {
    async createUser({ commit }, username) {
      commit("setLoading", true);
      try {
        const response = await axios.post(
          "http://localhost:3000/chat/createUser",
          {
            username,
          }
        );

        if (response.data && response.data.username) {
          commit("setUser", response.data);
          socket.emit("registerUser", { userId: response.data._id, username });
        }
      } catch (error) {
        console.error("Error al crear el usuario:", error);
      } finally {
        commit("setLoading", false);
      }
    },
    logoutUser({ commit, state }) {
      socket.emit("disconnectedUser", {
        userId: state.user.userId,
        username: state.user.username,
      });
      commit("setUser", null);
      commit("setActiveRoom", null);

      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem("chatApp");
        localStorage.removeItem("user");
      }
    },
    usersConnected({ commit, state }, users) {
      const userFilter = users.filter(
        (item) => item.userId !== this.state.user._id
      );

      if (state.userChatActive) {
        const verifyConnection = userFilter.some(
          (user) => user.userId === state.userChatActive.userId
        );
        if (!verifyConnection) {
          commit("setUserChatActive", {
            ...state.userChatActive,
            online: false,
          });
        }
      }
      commit("setUsersConnected", userFilter);
    },
    joinRoom({ commit }, { socket, userId, otherUserId }) {
      socket.off("chatHistory");
      socket.off("newMessage");
      socket.emit("joinRoom", { userId, otherUserId });

      const roomName = [userId, otherUserId].sort().join("_");
      commit("setActiveRoom", roomName);

      socket.on("chatHistory", (messages) => {
        commit("setChatRoomMessages", { room: roomName, messages });
      });

      socket.on("newMessage", (message) => {
        commit("addMessageToRoom", { room: message.room, message });
      });
    },
    sendMessage({ state }, { socket, message }) {
      socket.emit("message", {
        ...message,
        room: state.activeRoom,
        receiveId: state.userChatActive.userId,
      });
    },
    userChat({ commit }, users) {
      commit("setUserChatActive", { ...users, online: true });
    },
  },
  getters: {
    getUser(state) {
      return state.user;
    },
    isLoading(state) {
      return state.loading;
    },
    getUsersConnected(state) {
      return state.usersConnected;
    },
    getChatRoomMessages(state) {
      return state.chatRooms[state.activeRoom] || [];
    },
    getActiveRoom: (state) => state.activeRoom,
    getUserChatActive(state) {
      return state.userChatActive;
    },
    getChatRooms(state) {
      return state.chatRooms;
    },
  },
  plugins: [
    createPersistedState({
      key: "chatApp",
      storage: window.localStorage,
    }),
  ],
});
