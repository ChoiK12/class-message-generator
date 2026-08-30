// ========================================
// Cloudflare Worker
// ========================================

const API_BASE =
  "https://school-class-api.gangim2009.workers.dev";


// ========================================
// DOM
// ========================================

const noticeInput =
  document.getElementById("notice");

const loadButton =
  document.getElementById("loadBtn");

const copyButton =
  document.getElementById("copyBtn");

const result =
  document.getElementById("result");

const status =
  document.getElementById("status");

const schoolSettingBtn =
  document.getElementById("schoolSettingBtn");

const schoolModal =
  document.getElementById("schoolModal");

const closeModalBtn =
  document.getElementById("closeModalBtn");

const schoolSearchInput =
  document.getElementById("schoolSearchInput");

const schoolSearchBtn =
  document.getElementById("schoolSearchBtn");

const schoolSearchStatus =
  document.getElementById("schoolSearchStatus");

const schoolResults =
  document.getElementById("schoolResults");

const selectedSchool =
  document.getElementById("selectedSchool");

const gradeSelect =
  document.getElementById("gradeSelect");

const classSelect =
  document.getElementById("classSelect");

const breakfastCheck =
  document.getElementById("breakfastCheck");

const lunchCheck =
  document.getElementById("lunchCheck");

const dinnerCheck =
  document.getElementById("dinnerCheck");

const saveSchoolBtn =
  document.getElementById("saveSchoolBtn");

const schoolDisplay =
  document.getElementById("schoolDisplay");


// ========================================
// 현재 학교
// ========================================

let currentSchool = null;


// ========================================
// 날짜
// ========================================

function getTomorrow() {

  const date = new Date();

  date.setDate(
    date.getDate() + 1
  );

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}${month}${day}`;
}


// ========================================
// 급식 설정 가져오기
// ========================================

function getMealSettings() {

  const settings = [];

  if (breakfastCheck.checked) {
    settings.push("1");
  }

  if (lunchCheck.checked) {
    settings.push("2");
  }

  if (dinnerCheck.checked) {
    settings.push("3");
  }

  return settings;
}


// ========================================
// 설정 저장
// ========================================

function saveSettings() {

  if (!currentSchool) {
    return;
  }

  const settings = {

    school: currentSchool,

    grade:
      gradeSelect.value,

    className:
      classSelect.value,

    meals:
      getMealSettings()

  };

  localStorage.setItem(
    "classGeneratorSettings",
    JSON.stringify(settings)
  );

}


// ========================================
// 저장된 설정 불러오기
// ========================================

function loadSettings() {

  const saved =
    localStorage.getItem(
      "classGeneratorSettings"
    );

  if (!saved) {
    return false;
  }

  try {

    const settings =
      JSON.parse(saved);

    if (!settings.school) {
      return false;
    }

    currentSchool =
      settings.school;

    gradeSelect.value =
      settings.grade || "1";

    classSelect.value =
      settings.className || "1";


    // 기존 버전의 meal 설정도 대응
    if (settings.meals) {

      breakfastCheck.checked =
        settings.meals.includes("1");

      lunchCheck.checked =
        settings.meals.includes("2");

      dinnerCheck.checked =
        settings.meals.includes("3");

    }

    else {

      // 기본값: 중식

      breakfastCheck.checked =
        false;

      lunchCheck.checked =
        true;

      dinnerCheck.checked =
        false;

    }


    // 아무것도 선택되지 않았다면
    // 중식을 기본값으로

    if (
      !breakfastCheck.checked &&
      !lunchCheck.checked &&
      !dinnerCheck.checked
    ) {

      lunchCheck.checked = true;

    }


    updateSchoolDisplay();

    return true;

  }

  catch (error) {

    console.error(error);

    return false;

  }

}


// ========================================
// 학교 표시
// ========================================

function updateSchoolDisplay() {

  if (!currentSchool) {

    schoolDisplay.textContent =
      "학교 정보를 설정해주세요.";

    return;

  }

  schoolDisplay.textContent =
    `${currentSchool.name} · ${gradeSelect.value}학년 ${classSelect.value}반`;

}


// ========================================
// 학교 검색
// ========================================

async function searchSchools() {

  const keyword =
    schoolSearchInput.value.trim();

  if (!keyword) {

    schoolSearchStatus.textContent =
      "학교 이름을 입력해주세요.";

    return;

  }

  schoolSearchStatus.textContent =
    "검색 중...";

  schoolResults.innerHTML =
    "";


  try {

    const response =
      await fetch(
        `${API_BASE}/api/schools?keyword=${encodeURIComponent(keyword)}`
      );

    if (!response.ok) {

      throw new Error(
        "학교 검색 실패"
      );

    }

    const data =
      await response.json();

    const schools =
      data.schools || [];


    if (
      schools.length === 0
    ) {

      schoolSearchStatus.textContent =
        "검색 결과가 없습니다.";

      return;

    }


    schoolSearchStatus.textContent =
      `학교 ${schools.length}개를 찾았습니다.`;


    schools.forEach(
      school => {

        const button =
          document.createElement(
            "button"
          );

        button.className =
          "school-result";

        button.innerHTML =
          `<strong>${school.name}</strong>
           <span>${school.location || ""}</span>`;


        button.addEventListener(
          "click",
          () => {

            selectSchool(school);

          }
        );


        schoolResults.appendChild(
          button
        );

      }
    );

  }

  catch (error) {

    console.error(error);

    schoolSearchStatus.textContent =
      "학교 검색에 실패했습니다.";

  }

}


// ========================================
// 학교 선택
// ========================================

function selectSchool(school) {

  currentSchool =
    school;

  selectedSchool.innerHTML =
    `<strong>${school.name}</strong>
     <span>${school.location || ""}</span>`;

  schoolResults.innerHTML =
    "";

  schoolSearchStatus.textContent =
    "학교가 선택되었습니다.";

}


// ========================================
// 시간표
// ========================================

async function getTimetable() {

  if (!currentSchool) {

    throw new Error(
      "학교가 설정되지 않았습니다."
    );

  }

  const date =
    getTomorrow();

  const params =
    new URLSearchParams({

      date:
        date,

      officeCode:
        currentSchool.officeCode,

      schoolCode:
        currentSchool.schoolCode,

      grade:
        gradeSelect.value,

      className:
        classSelect.value

    });


  const response =
    await fetch(
      `${API_BASE}/api/timetable?${params}`
    );


  if (!response.ok) {

    throw new Error(
      "시간표 API 요청 실패"
    );

  }


  const data =
    await response.json();

  return data.timetable || [];

}


// ========================================
// 급식
// ========================================

async function getMeal() {

  if (!currentSchool) {

    throw new Error(
      "학교가 설정되지 않았습니다."
    );

  }


  const date =
    getTomorrow();


  const params =
    new URLSearchParams({

      date:
        date,

      officeCode:
        currentSchool.officeCode,

      schoolCode:
        currentSchool.schoolCode

    });


  const response =
    await fetch(
      `${API_BASE}/api/meal?${params}`
    );


  if (!response.ok) {

    throw new Error(
      "급식 API 요청 실패"
    );

  }


  const data =
    await response.json();


  return data.meals || {};

}


// ========================================
// 급식 표시
// ========================================

function createMealText(
  meals
) {

  const names = {

    "1":
      "조식",

    "2":
      "중식",

    "3":
      "석식"

  };


  const selected =
    getMealSettings();


  // 아무것도 선택하지 않은 경우
  // 중식으로 처리

  if (
    selected.length === 0
  ) {

    return `중식
급식이 없습니다.`;

  }


  const sections = [];


  selected.forEach(
    code => {

      const menu =
        meals[code] || [];


      sections.push(

        `${names[code]}
${
  menu.length > 0

    ? menu
        .map(
          item =>
            "ㆍ" + item
        )
        .join("\n")

    : "급식이 없습니다."
}`

      );

    }
  );


  return sections.join(
    "\n\n"
  );

}


// ========================================
// 반톡 문구
// ========================================

function createMessage(
  notice,
  timetable,
  meals
) {

  const noticeText =
    notice

      .split(/\r?\n/)

      .filter(
        line =>
          line.trim() !== ""
      )

      .map(
        line =>
          "- " +
          line.trim()
      )

      .join("\n");


  const timetableText =
    timetable.length > 0

      ? timetable.join("\n")

      : "시간표가 없습니다.";


  const mealText =
    createMealText(meals);


  return `공지사항📣
${noticeText || "- 없음"}

내일 시간표
${timetableText}

내일 급식🍚
${mealText}`;

}


// ========================================
// 정보 불러오기
// ========================================

loadButton.addEventListener(
  "click",
  async () => {

    if (!currentSchool) {

      alert(
        "먼저 학교 정보를 설정해주세요."
      );

      openModal();

      return;

    }


    loadButton.disabled =
      true;


    status.textContent =
      "내일 정보를 불러오는 중...";


    try {

      const [
        timetable,
        meals
      ] = await Promise.all([

        getTimetable(),

        getMeal()

      ]);


      result.textContent =
        createMessage(

          noticeInput.value,

          timetable,

          meals

        );


      status.textContent =
        "정보를 성공적으로 불러왔습니다.";

    }


    catch (error) {

      console.error(error);


      result.textContent =
        createMessage(

          noticeInput.value,

          [],

          {}

        );


      status.textContent =
        "정보를 불러오지 못했습니다.";

    }


    finally {

      loadButton.disabled =
        false;

    }

  }
);


// ========================================
// 복사
// ========================================

copyButton.addEventListener(
  "click",
  async () => {

    try {

      await navigator.clipboard.writeText(
        result.textContent
      );


      status.textContent =
        "📋 반톡 문구를 복사했습니다.";

    }

    catch (error) {

      status.textContent =
        "복사에 실패했습니다.";

    }

  }
);


// ========================================
// 팝업
// ========================================

function openModal() {

  schoolModal.classList.add(
    "show"
  );

}


function closeModal() {

  schoolModal.classList.remove(
    "show"
  );

}


schoolSettingBtn.addEventListener(
  "click",
  openModal
);


closeModalBtn.addEventListener(
  "click",
  closeModal
);


schoolModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      schoolModal
    ) {

      closeModal();

    }

  }
);


// ========================================
// 학교 검색
// ========================================

schoolSearchBtn.addEventListener(
  "click",
  searchSchools
);


schoolSearchInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      searchSchools();

    }

  }
);


// ========================================
// 학교 저장
// ========================================

saveSchoolBtn.addEventListener(
  "click",
  () => {

    if (!currentSchool) {

      alert(
        "학교를 먼저 선택해주세요."
      );

      return;

    }


    // 급식을 하나도 선택하지 않았으면
    // 중식 자동 선택

    if (
      getMealSettings().length === 0
    ) {

      lunchCheck.checked =
        true;

    }


    saveSettings();

    updateSchoolDisplay();

    closeModal();

    status.textContent =
      "학교 정보가 저장되었습니다.";


    result.textContent =
`공지사항📣
- 

내일 시간표
정보를 불러오려면 버튼을 눌러주세요.

내일 급식🍚
정보를 불러오려면 버튼을 눌러주세요.`;

  }
);


// ========================================
// 시작
// ========================================

const hasSettings =
  loadSettings();


if (!hasSettings) {

  openModal();

}