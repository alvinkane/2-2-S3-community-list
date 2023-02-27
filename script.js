const Base_URL = "https://user-list.alphacamp.io/";
const Index_URL = Base_URL + "api/v1/users";

const userCard = document.querySelector("#user-card");
const userInfo = document.querySelector("#user-info");

const userName = document.querySelector("#user-name");
const userImg = document.querySelector("#user-img");
const userDetail = document.querySelector("#user-detail");

// search
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");

// 分頁數量
const pageAmount = 21;

// pagination
const pagination = document.querySelector("#pagination");

const users = [];
const usersDetail = [];
let searchName = [];

// 將page重拿出來
let page = 1;

// 建立初始介面
function renderUserList(data) {
  let rawHtml = "";
  let likeSignal = "";
  let likeColor = "";
  // 從loaclStorage抓取收藏的資料，如果有收藏的，收藏按鈕就為v
  const favoriteList = JSON.parse(localStorage.getItem("favorite")) || [];
  data.forEach((list) => {
    // 如果資料有問題則不建立
    if (Object.values(list).some((value) => !value)) return;
    if (favoriteList.some((value) => value.id === list.id)) {
      likeSignal = "v";
      likeColor = "btn-danger";
    } else {
      likeSignal = "+";
      likeColor = "btn-primary";
    }
    rawHtml += `<div class="card mb-2 ms-4 position-relative" style="width: 10rem;">
      <img src="${list.avatar}" class="card-img card-img-top" alt="..." data-bs-toggle="modal" data-bs-target="#img-modal" data-id = ${list.id}>
      <div class="card-body d-flex">
        <p class="card-text">${list.name} ${list.surname}</p>
      </div>
      <a href="#" class="btn ${likeColor} btn-sm position-absolute top-0 end-0" data-id = ${list.id} >${likeSignal}</a>
    </div>`;
  });
  userCard.innerHTML = rawHtml;
}

// 建立showmodal的介面
function renderShowModal(id) {
  axios
    .get(Index_URL + "/" + id)
    .then((response) => {
      const data = response.data;
      userName.textContent = data.name + " " + data.surname;
      userImg.innerHTML = `
      <img src="${data.avatar}" alt="img">
    `;
      userDetail.innerHTML = `
      <p>email : ${data.email}</p>
      <p>gender : ${data.gender}</p>
      <p>age : ${data.age}</p>
      <p>region : ${data.region}</p>
      <p>birthday : ${data.birthday}</p>
    `;
    })
    .catch((error) => console.log("err"));
}

// 計算分頁的頁數，產生相應數量的分頁碼
function renderPagination(data) {
  //計算頁碼數量(200 / 21 = 9 ... 11 -> 10)
  const page = Math.ceil(data.length / pageAmount);
  let rawHTML = "";
  for (let i = 1; i <= page; i++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page='${i}'>${i}</a></li>
    `;
  }
  pagination.innerHTML = rawHTML;
}
// 儲存資料至localStorage
function addToLocalStorage(id) {
  // 先從locakStorage抓取資料，之後每按一次，往後疊加，第一次沒有資料就為空陣列
  const list = JSON.parse(localStorage.getItem("favorite")) || [];
  const listDetail = JSON.parse(localStorage.getItem("favoriteDetail")) || [];
  // 根據id取得物件
  const userObj = users.find((user) => user.id === id);
  // 如果重複按到不要加入
  if (list.some((listUser) => listUser.id === id)) return;
  list.push(userObj);
  listDetail.push(userObj);
  // 將資料丟至localStorage
  localStorage.setItem("favorite", JSON.stringify(list));
  localStorage.setItem("favoriteDetail", JSON.stringify(listDetail));
}

function removeFromLocalStorage(id) {
  const list = JSON.parse(localStorage.getItem("favorite")) || [];
  const listDetail = JSON.parse(localStorage.getItem("favoriteDetail")) || [];
  // 確認是否有在清單內
  if (!list.some((value) => value.id === id)) return;
  // 找出清單內的該項目後移除
  const index = list.findIndex((value) => value.id === id);
  list.splice(index, 1);
  listDetail.splice(index, 1);
  // 將資料丟置localStorage
  localStorage.setItem("favorite", JSON.stringify(list));
  localStorage.setItem("favoriteDetail", JSON.stringify(listDetail));
}

// 根據頁數渲染頁面
function renderPage(page) {
  // 根據選的頁數，利用slice區分data的範圍(0-20、21-41)
  const startIndex = (page - 1) * pageAmount;
  const endIndex = startIndex + pageAmount;
  // 根據input有無值選擇分割的變數
  const data = searchInput.value.length ? searchName : users;
  return data.slice(startIndex, endIndex);
}

//統一在card做
userCard.addEventListener("click", function cardClicked(event) {
  //按img時會顯示詳細資料
  const id = Number(event.target.dataset.id);
  //如果已經收藏了，就將like取消
  if (event.target.tagName === "IMG") {
    renderShowModal(id);
    // 按+時，會將數據存在localstorage
  } else if (event.target.tagName === "A") {
    // 當按+時，也需將細部資料帶入另一個html，所以建另一個變數存取所有資料
    axios
      .get(Index_URL + "/" + id)
      .then((response) => {
        const result = response.data.results;
        usersDetail.push(result);
      })
      .catch((error) => console.log(error));
    // 收藏跟取消收藏的功能
    if (event.target.textContent === "+") {
      addToLocalStorage(id);
    } else if (event.target.textContent === "v") {
      removeFromLocalStorage(id);
    }
    // 重新炫染
    // 用page原因為保持原本頁數
    renderUserList(renderPage(page));
  }
});

// 在input輸入數值
// 按下search並顯示搜尋結果
searchForm.addEventListener("submit", function onClickedButton(event) {
  // 不自動刷新
  event.preventDefault();
  const target = event.target;
  // 對input值做調整
  const inputValue = searchInput.value.trim().toLowerCase();
  // 如果按的位置不是button跟沒有輸入東西則不執行
  if (target.tagName !== "FORM") return;
  if (inputValue === "") {
    renderUserList(renderPage(1));
    renderPagination(users);
    return;
  }
  // 改為全域
  // let searchName = []
  // 對每一個user的名字進行搜尋
  // filter內user => 後不能用大括號{}
  searchName = users.filter(
    (user) =>
      user.name.toLowerCase().includes(inputValue) ||
      user.surname.toLowerCase().includes(inputValue)
  );
  renderUserList(renderPage(1));
  renderPagination(searchName);
  // 清空input，放最後面
  // searchInput.value = ''
});

// input清空後重新渲染
searchForm.addEventListener("input", function onClickedButton(event) {
  const inputValue = searchInput.value.trim().toLowerCase();
  if (inputValue === "") {
    renderUserList(renderPage(1));
    renderPagination(users);
    return;
  }
});

// 設置監聽器，切換頁數時，重新渲染
pagination.addEventListener("click", function onClickedPage(event) {
  // 改為全域
  page = event.target.dataset.page;
  if (event.target.tagName !== "A") return;
  renderUserList(renderPage(page));
});

//抓取資料
axios
  .get(Index_URL)
  .then((response) => {
    const result = response.data.results;
    users.push(...result);
    renderUserList(renderPage(1));
    renderPagination(users);
  })
  .catch((error) => console.log(error));
