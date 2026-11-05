// The SVG is laid out on a 1200 × 720 drawing board. Poses share one head,
// one neck, and the same shoulder anchors; only wardrobe and props change.
const navy = "#344359";
const gold = "#d8a74f";
const skin = "#f1cc9e";
const paper = "#faf6eb";
const hair = "#292c34";

function rng(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

const path = (d, fill = "none", attrs = "") => `<path d="${d}" fill="${fill}" ${attrs}/>`;
const use = (id, attrs = "") => `<use href="#intro-${id}" ${attrs}/>`;
const detail = (d, color = "#7b8790", opacity = .56) =>
  path(d, "none", `stroke="${color}" stroke-width="1.05" opacity="${opacity}"`);

function character() {
  const shirt = "#f7eddb";
  const coat = "#455b77";
  return `
    <g transform="translate(600 528)">
      <g id="intro-student" class="ink" stroke-width="2.1">
        <g data-pose="arrival">
          ${path("M-65-152Q-114-166-136-123Q-162-81-176 12Q-165 37-92 47L-48-105Z", "#637e9b")}
          ${path("M-135-108Q-139-139-114-147Q-100-151-95-133M-151-31Q-121-40-96-19L-105 24Q-129 24-164 14Z", "#7690a7")}
          ${detail("M-147-52Q-127-59-107-50M-163 2Q-130 12-109 10M-139-121Q-154-92-159-58", "#354858", .9)}
          ${path("M-62-141Q-39-153-17-157L26-152Q55-146 68-128Q92-94 98-49L77-37Q80 15 95 67Q24 86-82 62Q-76 26-86 1L-117-19Q-109-109-62-141Z", shirt)}
          ${path("M-66-141Q-52-148-40-149Q-66-118-27-77L-39-59Q-73-87-75-108Q-81-78-81-34L-96-28Q-94-101-66-141Z", "#566f8c")}
          ${path("M-23-156Q-4-140 17-136L3-110L-32-141ZM17-136L35-153L51-139L33-116Z", "#fff8e9")}
          ${path("M-108-33Q-97-24-76-21Q-59-41-36-64L-30-83Q-23-93-17-82L-14-71Q-6-68-11-61Q-2-54-10-48Q-7-42-21-32Q-57 10-81 18Q-102 24-112 8Q-120-7-108-33Z", skin)}
          ${detail("M-98-21Q-103-3-92 7M-72 12Q-53 0-40-16M61-107Q64-82 76-56M40-93Q39-39 52 41M58 57Q44 43 42 24M-71 37Q-59 53-40 57", "#a89b82")}
          ${path("M45-100Q59-53 74-39Q74 2 87 56Q68 66 49 60Q56 19 45-100ZM-78 20Q-57 31-45 50Q-53 53-78 43Z", "url(#intro-hatch)", 'stroke="none" opacity=".65"')}
          ${path("M-80 62Q5 82 93 67L114 277H-104Z", "#5c6d7c")}
          ${detail("M-56 77Q-67 102-68 146M64 79L82 151M-12 82L-8 148", "#c0c3bb")}
        </g>
        <g data-pose="learning">
          ${path("M-60-143Q-35-154-17-156L27-153Q57-145 78-118L111-53L88-35L77 42L-93 49Q-81 11-89-36L-117-48Q-103-116-60-143Z", "#566f91")}
          ${path("M-33-148Q-21-115 4-112Q24-114 42-147Q24-126 8-130Q-14-130-33-148Z", "#7089a3")}
          ${path("M-109-57Q-99-50-84-49Q-91-26-75-17Q-38-20 4-14L26-24Q43-26 52-17L64-9Q67-2 55-3L38-8L49 2Q52 7 42 7L23-1Q-38 8-77 15Q-102 16-112-1Q-121-18-109-57Z", skin)}
          ${path("M86-72Q95-75 108-64Q114-40 128-17L164-11Q172-8 165-2L121 8Q105 10 98-9L82-42Z", skin)}
          ${detail("M-91-83L-77-58M-73-37L-64-23M32-98Q48-78 57-67M63-58L74-42M-51 25Q3 19 39 30", "#acbac6")}
          ${path("M31-108Q69-98 95-57L86-43Q62-75 40-84ZM-100-76Q-86-64-80-40L-86-23L-99-46Z", "url(#intro-hatch)", 'stroke="none" opacity=".67"')}
        </g>
        <g data-pose="career">
          ${path("M-76 57Q-10 71 71 57L108 273H-100Z", "#344359")}
          ${path("M-36-147L-17-156L28-152L47-139L46 71L-45 70Z", shirt)}
          ${path("M-36-150Q-76-149-99-118Q-114-91-127-22L-111 13L-82 9L-92 80Q-73 94-24 79L-5-59ZM33-151Q66-146 87-128Q103-115 126-29Q126-6 108 10L83 6L95 83Q69 94 33 77L15-60Z", coat)}
          ${path("M-38-151L-59-132L-44-102L-61-98L-13-38L-7-58ZM35-150L58-133L47-109L61-101L22-39L17-60Z", "#657b95")}
          ${path("M-22-155Q-3-139 14-139L3-118L-29-142ZM14-139L30-153L42-143L30-121Z", "#fff8e9")}
          ${path("M-24 64L37 63L38 73L-25 74Z", "#302d31")}
          ${path("M0 64H15V73H0Z", "#b59a6f")}
          ${path("M37-64L112-78L119 22L44 42Z", "#454547")}
          ${path("M42-60L111-72M48 35L112 18", "none", 'stroke="#a6a2a0" stroke-width="1"')}
          ${path("M107-22Q114-17 110-7Q95 6 77 3Q65-1 65-7L76-10L65-16Q64-21 71-22L87-19L100-25Z", skin)}
          ${path("M-112-14Q-100-18-91-12L-78 13Q-75 23-84 28L-94 22L-101 5Z", skin)}
          ${detail("M-88-107Q-99-87-99-58M-102-43Q-105-28-113-26M-82 35L-66 29M-40 44Q-45 57-45 66M85 47L83 67M104-93L112-74", "#a6b1be")}
          ${path("M-95-96Q-102-47-119-24L-112 3L-97-3L-82-48ZM72 8Q89 23 85 79L64 81Q70 42 56 15ZM-75 80L-46 84L-57 162L-84 184Z", "url(#intro-hatch)", 'stroke="none" opacity=".72"')}
          ${detail("M-63 90Q-65 115-62 148M52 89L68 145M8 78L12 155", "#8796a4")}
        </g>
        <g data-pose="graduate">
          ${path("M-51-148Q-20-157-11-156L30-150Q59-145 82-122Q107-90 129 57Q100 78 80 73L109 280H-117L-90 64Q-113 69-143 47Q-128-67-99-111Q-80-140-51-148Z", navy)}
          ${path("M-58-145Q-29-124 6-82Q36-120 49-148L70-133Q54-84 22-45L34 177L8 183L0-43L-25 177L-54 182Q-42 26-21-47Q-55-95-75-133Z", gold)}
          ${path("M-30-150Q-14-135 8-136Q23-136 38-149L26-123L6-87L-8-112Z", "#fff4db")}
          ${detail("M-99-102Q-107-56-121-27M-86-68Q-101-15-102 29M-75-49Q-75-5-84 47M75-96Q87-73 93-40M81-55Q88-13 102 14M59 0Q68 54 71 108M-63 73L-71 113M5-35L-2 105", "#a9b6c7", .8)}
          ${detail("M-64-134Q-44-102-28-78M-26-44Q-45 29-43 100M58-132Q45-105 29-83M23 31L28 112", "#fcdf91", .9)}
          ${path("M-89-106Q-81-33-114 64L-135 47Q-116-66-89-106ZM-83 54Q-60 77-77 211L-106 219ZM53-33Q76-17 86 53L107 188L73 199Z", "url(#intro-light-hatch)", 'stroke="none" opacity=".72"')}
          <g data-throw-arm>
            ${path("M-117 12Q-147 10-159-19Q-177-60-175-98L-147-110Q-131-78-111-49L-93-34Q-90-5-117 12Z", "#465974")}
            ${path("M-171-94Q-184-122-188-159L-196-185Q-201-195-195-197L-185-184L-188-204Q-189-212-183-211L-176-191L-172-211Q-170-218-165-214L-165-192L-156-204Q-151-208-148-202L-157-179L-157-157Q-154-131-145-109Z", skin)}
            ${detail("M-164-166Q-163-142-156-127M-164-83Q-161-59-143-35M-147-70Q-140-53-125-33M-144-15Q-135 0-123 3", "#a5aebd")}
          </g>
        </g>
        <g id="intro-head">
          ${path("M-67-248Q-65-291-28-308Q18-331 54-301Q76-285 72-250Q69-229 83-213Q99-195 80-176Q104-156 81-132Q64-119 50-133Q33-120 19-141Q-5-123-22-134Q-37-118-57-128Q-81-120-95-137Q-127-134-137-155Q-156-154-157-173Q-156-190-137-198Q-142-178-127-183Q-112-189-117-204Q-122-221-103-232Q-83-239-67-248Z", hair)}
          ${path("M-25-194Q-11-173-24-150Q-8-131 11-133Q23-136 33-150Q20-168 29-197Z", skin)}
          ${path("M-23-188Q-11-175 25-182L23-165Q-2-164-23-174Z", "#dba77c", 'stroke="none"')}
          ${path("M-47-249Q-43-277-21-290Q3-305 25-294Q48-282 57-253Q66-223 60-202Q51-180 26-178Q-3-178-23-195Q-45-214-47-249Z", "url(#intro-skin)")}
          ${path("M-121-194Q-112-211-90-215Q-72-220-67-244Q-59-276-37-295Q-10-321 19-307Q27-306 33-298Q4-302-5-277Q-14-251-36-236Q-58-223-63-201Q-65-178-88-172Q-109-165-108-147Q-124-156-121-169Q-117-178-101-187Q-87-196-90-206Q-105-194-121-194Z", "#333640")}
          ${path("M20-307Q37-314 56-294Q73-281 67-250Q65-229 80-211Q87-199 81-190Q64-201 59-224Q59-251 47-274Q33-298 20-307Z", "#363842")}
          ${detail("M22-307Q-9-315-37-286Q-53-271-57-249Q-63-223-90-211M10-302Q-15-298-26-269Q-38-242-67-227M-19-278Q-29-247-46-238Q-64-225-72-209Q-77-188-96-182M-67-197Q-72-177-91-167Q-110-158-98-144M-113-197Q-124-183-139-181Q-150-176-144-164M-89-176Q-79-162-96-151Q-103-144-92-134M-68-158Q-80-146-69-135M47-295Q65-275 62-249M66-239Q65-218 79-205M65-182Q87-167 74-148M48-169Q60-151 48-140", "#98917e", .82)}
          ${detail("M15-307Q-11-309-35-281Q-48-264-53-250M5-304Q-15-303-31-278Q-42-252-60-243M-11-291Q-26-273-36-255M-61-236Q-73-222-96-217M-78-197Q-85-183-101-177M-128-172Q-140-165-132-157M-110-167Q-124-150-107-143M-72-148Q-67-139-62-139M52-285Q59-272 59-255M73-221Q83-211 84-201M70-179Q80-166 70-154M42-157Q53-147 48-138", "#ada58f", .52)}
          ${path("M-147-158Q-130-144-112-153M-112-136Q-89-126-75-137M-59-278Q-43-307-10-315", "none", 'stroke-width=".85" opacity=".65"')}
        </g>
        <g data-worn-cap transform="translate(8 -303) rotate(-10) scale(.67)">${use("cap")}</g>
        <path class="draw-line" pathLength="1" d="M-151-172Q-158-190-133-197Q-117-204-103-232Q-83-239-67-248Q-64-293-28-308Q18-331 54-301Q76-285 72-250Q68-229 83-213Q99-195 80-176M-62-141Q-105-127-117-19Q-130 11-104 23Q-83 29-70 14M60-135Q90-115 98-49" fill="none" stroke="#172539" stroke-width="2.4"/>
      </g>
    </g>`;
}

function trees() {
  const r = rng(401);
  let leaves = "";
  for (const [x, y, width, height] of [[127, 123, 158, 109], [32, 221, 102, 126], [1110, 151, 175, 105], [1008, 198, 107, 76]]) {
    for (let i = 0; i < 88; i++) {
      const a = r() * Math.PI * 2;
      const radius = Math.sqrt(r());
      const cx = x + Math.cos(a) * width * radius;
      const cy = y + Math.sin(a) * height * radius;
      const len = 4 + 20 * r();
      leaves += path(`M${cx.toFixed(1)} ${cy.toFixed(1)}q-${(len * .7).toFixed(1)} -6 -${len.toFixed(1)} 3q5 8 ${len.toFixed(1)} 0Z`,
        ["#deb35b", "#e8c77d", "#f1db9f", "#c89139"][i % 4], `opacity="${(.29 + r() * .48).toFixed(2)}"`);
    }
  }
  return `<g opacity=".84" stroke="none">
    ${path("M54 516Q74 392 87 297Q109 218 106 125M87 305Q69 218 15 147M95 274Q135 183 211 132M102 213Q124 152 170 93M1127 532Q1117 423 1089 313Q1060 224 1066 165M1097 331Q1128 239 1196 197M1078 264Q1030 215 974 190", "none", 'stroke="#827655" stroke-width="4"')}
    ${leaves}
  </g>`;
}

function scenery() {
  return `
    <g data-setting="arrival">
      <g opacity=".66" class="ink" stroke-width="1.25">
        ${path("M162 476L162 330L270 306L368 323V479ZM843 477V332L933 302L1059 332V476Z", "#e5e8e3")}
        ${path("M191 352L226 345V375L191 379ZM248 339L282 336V365L248 369ZM193 395L228 391V420L193 423ZM246 384L281 379V410L246 415ZM929 338L956 344V372L929 366ZM979 348L1005 353V380L979 376Z", "#afbfc5")}
        ${path("M319 499L322 250L849 216L854 510L727 503V379Q719 300 600 302Q487 309 474 402L473 500Z", "#efe7d5")}
        ${path("M308 252L305 232L866 194L864 217Z", "#f7efdb")}
        ${path("M452 501V394Q454 304 529 284Q599 261 659 277Q738 296 749 377V501L724 500V384Q715 303 608 304Q499 302 475 395V501Z", "#bdc6c5")}
        ${path("M333 473L334 267L828 234L837 481M354 478L356 286L415 281L413 481M776 474L773 261L813 257L821 481M467 465L467 397Q470 325 534 301M726 465L728 380Q717 323 678 305", "none", 'stroke="#7e8b8c"')}
        ${path("M326 257L851 220L852 243L327 279ZM361 288L411 283L410 480L361 480ZM776 267L814 261L821 482L782 481Z", "url(#intro-hatch)", 'stroke="none" opacity=".52"')}
        ${detail("M317 246L592 228M698 222L861 210M342 496L394 495M438 470L440 393Q442 341 479 310M749 473L752 393Q750 359 733 336M828 491L850 490", "#52667b", .73)}
        <text x="589" y="260" text-anchor="middle" fill="#4b6076" stroke="none" font-family="Georgia,serif" font-size="23" letter-spacing="8">SRM</text>
        ${detail("M166 512Q572 472 1060 514M211 552L485 503M962 547L724 506M196 590L427 532M1024 591L779 532M183 540L192 538M234 547L288 534M888 539L926 543")}
      </g>
      ${trees()}
    </g>
    <g data-setting="learning">
      <g class="ink" opacity=".68" stroke-width="1.3">
        ${path("M103 461V137L1090 108L1098 479Z", "#e8e8de")}
        ${path("M147 400L145 173L1054 151L1061 414Z", "#e3eceb")}
        ${path("M150 310Q280 261 396 313T659 312T1054 267V407L148 397Z", "#e8d8a9", 'stroke="none" opacity=".75"')}
        ${path("M322 171L326 399M479 166L481 400M701 158L711 401M895 155L903 409M148 266L1057 258M100 460L1098 479", "none", 'stroke="#6e879a" stroke-width="5"')}
        ${path("M183 211l59-28m-44 55 87-47m447 37 78-52m-49 62 94-54m81 37 49-31", "none", 'stroke="#fff9e9" stroke-width="3"')}
        ${path("M75 489Q183 466 322 475L348 492L345 504L77 506ZM847 488L1118 478L1142 496L1139 509L844 510Z", "#d2bc91")}
        ${path("M111 511L109 558M321 511L324 548M886 514L886 554M1110 511L1112 562", "none")}
      </g>
    </g>
    <g data-setting="career" class="ink" opacity=".67" stroke-width="1.25">
      ${path("M719 502L727 241L1135 134L1148 516Z", "#d7e3e7")}
      ${path("M743 254L1123 158L1132 437L742 467Z", "#b8cbd3")}
      ${path("M796 241L800 455M852 227L857 450M914 213L919 444M981 196L984 438M1047 180L1052 429M744 312L1126 231M743 377L1129 316M742 436L1132 398", "none", 'stroke="#6c8495" stroke-width="2"')}
      ${path("M719 235L1143 122L1145 137L718 251Z", "#ede5d2")}
      ${path("M109 515L138 350L418 285L464 484Z", "#e6dfce")}
      ${path("M140 348L421 277M144 377L425 313M158 405L430 348M194 421L445 384M141 487L455 445", "none")}
      ${path("M157 526Q597 478 1146 529M166 562L489 501M1032 570L748 506", "none", 'stroke="#9d9b8d"')}
      ${trees()}
    </g>
    <g data-setting="graduate" class="ink" stroke-width="1.05" opacity=".66">
      ${path("M96 519L95 400L234 384L235 346L317 340L319 402L461 418L461 481ZM794 477L795 377L838 365L838 318L994 311L995 352L1032 359L1035 465Z", "#e9e3d2")}
      ${path("M859 317L859 291L981 288L981 311M840 366L997 356M834 388L1009 381M873 423L874 391L900 390V421M929 419V388L954 386V416M177 449V414L203 410V444M258 410V366L281 363V410", "none")}
      <text x="920" y="349" fill="#4b6076" stroke="none" text-anchor="middle" font-family="Georgia,serif" font-size="24" letter-spacing="4">SRM</text>
      ${path("M154 294Q193 269 232 287Q251 246 303 266Q326 234 371 254M749 239Q790 209 822 234Q845 202 881 218Q902 190 960 212M78 328Q108 311 141 316", "none", 'stroke="#8fa8b8" opacity=".8"')}
    </g>`;
}

function desk() {
  return `<g data-desk class="ink" stroke-width="1.65">
    ${path("M204 576Q550 527 1014 566L1003 630Q591 658 183 620Z", "#e8cfa0")}
    ${path("M183 620Q584 657 1003 630L1001 642Q620 667 186 635Z", "#bd9764")}
    ${detail("M263 587Q315 577 389 578M210 610Q339 617 402 613M779 614Q880 619 963 607M807 600Q899 602 928 594", "#aa8355")}
    ${path("M364 557L468 551L507 562L494 584L380 591L352 577Z", "#657d98")}
    ${path("M359 556L467 547L501 556L491 571L376 581L354 573Z", "#f4ecd7")}
    ${path("M369 532L478 527L498 536L493 552L383 561L362 549Z", gold)}
    ${path("M373 532L479 526L492 536L488 546L381 553L365 546Z", "#fff5dd")}
    ${detail("M381 550L481 542M375 576L483 566", "#88785e")}
    ${path("M483 579Q510 550 554 557Q580 558 597 575Q618 554 665 558L692 585L603 596Z", "#57718b")}
    ${path("M489 574Q535 540 594 569Q633 549 667 554L684 577Q626 575 600 588Q545 568 489 581Z", "#faf1dd")}
    ${detail("M509 570Q544 554 577 569M611 571Q635 559 663 566M598 575L601 585", "#7e8484")}
    ${path("M641 576L779 581L849 549L719 550Z", "#adb8bb")}
    ${path("M690 570L716 471Q719 461 731 460L860 464Q870 464 866 475L845 554L779 581Z", "#c3cbca")}
    ${path("M704 565L725 477L851 479L832 550Z", "url(#intro-hatch)", 'stroke="none" opacity=".46"')}
    ${detail("M712 568L837 549M723 472L853 473M651 577L776 585L851 553", "#526676", .9)}
  </g>`;
}

const crowdHair = [
  "M-12-36Q-17-23-10-18L-7-24L9-27L13-19Q18-24 13-38Z",
  "M-14-35Q-20-30-17-22Q-21-13-13-12L-9-15L-8-30L10-31Q10-18 15-14Q23-14 18-22Q22-31 13-38Z",
  "M-12-37Q-18-30-14-20Q-11-23-8-29Q2-27 11-33L15-25Q18-33 12-37Z",
  "M-13-37Q-21-31-17-25Q-22-18-17-14Q-22-6-13-4Q-8-8-10-14L-8-31L11-34L13-23Q19-23 16-36Z",
  "M-14-33Q-17-25-11-21L-7-27Q1-34 9-29Q11-20 17-17Q22-17 19-22Q14-28 17-34Z",
  "M-14-36Q-17-27-11-22L-8-28L-1-30Q7-27 14-32L15-25Q20-30 15-36Z",
];

function crowdSymbol(i) {
  const r = rng(800 + i * 977);
  const color = ["#43536d", "#596b82", "#39475c", "#63768b", "#485975"][i % 5];
  const complexion = ["#ebc798", "#dfae7f", "#f5d9b0", "#be8d6a", "#e6bc9b"][i % 5];
  const l = 15 + Math.round(r() * 10), right = 15 + Math.round(r() * 10);
  const lean = Math.round(r() * 8) - 4;
  const tilt = Math.round(r() * 26) - 13;
  const hands = [
    ["M-14-5Q-29-9-32-29L-23-35L-13-16Z", "M-32-27L-39-44L-43-52Q-44-57-40-55L-36-51L-36-60Q-34-62-32-59L-29-51L-26-57Q-22-57-23-52L-25-43L-23-34Z"],
    ["M14-6Q25-15 30-26L40-18Q33 0 19 9Z", "M30-26L38-41L41-53Q44-56 45-51L44-45L49-51Q53-52 51-47L46-38L40-18Z"],
    ["M-17-5Q-30-2-36-17L-43-9Q-39 9-21 13Z", "M-43-9L-51-20Q-55-25-50-26L-45-22Q-46-28-42-29Q-39-27-37-22L-36-17Z"],
    ["M17-4Q33-3 39-16L45-9Q41 11 23 15Z", "M39-16L46-26Q50-30 52-26L48-20L56-25Q59-24 55-19L45-9Z"],
  ];
  const raised = i % 7 < 4 ? hands[i % 7] : null;
  const arm = raised ? path(raised[0], color) + path(raised[1], complexion) : "";
  const hat = use("cap", `transform="translate(${lean} -38) rotate(${tilt}) scale(.243)"`);
  return `<g id="intro-arm-${i}" class="ink" stroke-width="1.18">${arm}</g>
  <g id="intro-hat-${i}">${hat}</g>
  <g id="intro-grad-${i}" class="ink" stroke-width="1.18">
    ${i >= 16 ? arm : ""}
    ${path(`M-8-13Q-${l} -10 -${l + 4} 5Q-${l + 7} 20 -${l + 6} 40Q0 46 ${right + 6} 42Q${right + 2} 5 ${right} -3Q12-12 7-13Z`, color)}
    ${path("M-11-12Q-4-9 0 4Q5-7 12-12L17-8L7 13L9 42L3 43L0 15L-3 42L-10 43L-6 12L-17-8Z", i % 4 === 0 ? "#e3ba72" : gold)}
    ${path("M-5-18L-6-11L0-3L7-11L5-20Z", complexion)}
    <g transform="translate(${lean} -1)">
      ${path(crowdHair[i % crowdHair.length], i % 5 === 1 ? "#514337" : "#333640")}
      ${path(i % 3 === 0 ? "M-10-34Q0-39 10-34Q14-27 10-19Q6-11-1-12Q-12-13-12-24Q-13-29-10-34Z" :
        i % 3 === 1 ? "M-10-33Q-2-37 9-34Q13-28 12-21Q10-12 2-12Q-9-12-11-21Q-13-28-10-33Z" :
          "M-11-34Q-2-39 8-34Q12-30 11-22Q9-13 3-12Q-7-11-11-21Q-13-29-11-34Z", complexion)}
      ${path(i % 2 === 0 ? "M-14-34Q-9-43 11-38L15-33Q8-34 1-31Q-6-27-11-22Q-16-26-14-34Z" : "M-13-34Q-7-42 9-38Q16-35 14-27Q11-31 8-31Q1-27-8-30L-13-23Z", "#353640")}
    </g>
    ${i >= 16 ? hat : ""}
    ${i < 16 ? detail("M-18 2Q-20 14-19 29M-13 20L-16 37M16 3Q20 16 21 30M14 20L16 35M-4 24L-5 38", "#b6c1c8", .74) +
      path("M-18 1Q-13 13-14 35L-22 38Q-23 21-18 1ZM15 1Q26 20 27 39L22 40Q20 18 15 1Z", "url(#intro-light-hatch)", 'stroke="none" opacity=".8"') : ""}
  </g>`;
}

function crowd(mobile) {
  const r = rng(7212);
  const counts = mobile ? [98, 82, 60, 42, 29, 16] : [96, 83, 61, 46, 32, 17];
  // Stagger the horizon bands in both axes and sort each by depth for overlap.
  return counts.map((count, band) => {
    const span = mobile ? 670 : 1430;
    const min = 600 - span / 2;
    const baseline = [408, 438, 472, 515, 580, 655][band];
    const size = mobile ? [.37, .43, .55, .76, 1.06, 1.57][band] : [.48, .59, .76, 1.01, 1.36, 2.11][band];
    const figures = Array.from({ length: count }, (_, i) => ({
      x: min + (i + (r() - .5) * 1.65) * span / (count - 1),
      y: baseline + (r() - .5) * (18 + band * 12) + Math.sin(i * .18 + band) * (band + 6),
      s: size * (.76 + r() * .51),
      rot: r() * 15 - 7.5,
      mirror: r() > .5 ? 1 : -1,
      variant: band >= 4 ? i % 16 : 16 + Math.floor(r() * 16),
    })).sort((a, b) => a.y - b.y);
    return `<g data-crowd="${band}" opacity="${[.47, .62, .74, .85, .96, 1][band]}">
      ${figures.map(({ x, y, s, rot, mirror, variant }, i) => {
        const placement = `transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${(s * mirror).toFixed(3)} ${s.toFixed(3)})"`;
        if (band < 4) return use(`grad-${variant}`, placement);
        const gesture = variant % 7 < 4;
        const delay = 4490 + Math.round(r() * 370);
        const isVisible = Math.abs(x - 600) < (mobile ? 300 : 640);
        return `<g ${placement} data-grad>
          ${gesture ? `<g class="moving-part" ${isVisible ? `data-cheer="${delay}" data-arm-side="${variant % 2 === 0 ? 1 : -1}"` : ""}>${use(`arm-${variant}`)}</g>` : ""}
          ${use(`grad-${variant}`)}
          <g class="moving-part" ${gesture && isVisible && i % 2 === 0 ? `data-crowd-toss="${delay + 240}"` : ""}>${use(`hat-${variant}`)}</g>
        </g>`;
      }).join("")}
    </g>`;
  }).join("");
}

function airborneCaps(mobile) {
  const r = rng(752);
  return Array.from({ length: mobile ? 18 : 32 }, (_, i) => {
    const near = i < 6;
    const x = 600 + (r() > .5 ? 1 : -1) * (96 + r() * (mobile ? 258 : 532));
    const y = (near ? 555 : 421) + r() * 100;
    const scale = near ? .23 + r() * .23 : .059 + r() * .19;
    const dx = (r() - .5) * (near ? 310 : 225);
    const rise = (near ? 256 : 145) + r() * (near ? 170 : 156);
    const spin = (r() > .5 ? 1 : -1) * (50 + r() * 250);
    const delay = 4690 + r() * 440;
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      <g class="moving-part" data-air-cap="${[dx, rise, spin, delay].map(Math.round).join(",")}">${use("cap", `transform="scale(${scale.toFixed(2)})"`)}</g>
    </g>`;
  }).join("");
}

function paperMarks() {
  const r = rng(1200);
  let marks = "";
  for (let i = 0; i < 1180; i++) {
    const x = r() * 1600 - 200, y = r() * 950 - 120;
    marks += `M${x.toFixed(1)} ${y.toFixed(1)}l${(1 + r() * 3).toFixed(1)} -.5`;
  }
  return path(marks, "none", 'stroke="#887e66" stroke-width=".65" opacity=".22"');
}

export function introArtwork(mobile) {
  return `<svg class="intro-art" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 1200 720">
    <defs>
      <pattern id="intro-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(29)">
        <path d="M.6 0L1.2 8M4 1L3.8 7" stroke="#596979" stroke-width=".57" opacity=".54"/>
      </pattern>
      <pattern id="intro-light-hatch" width="6" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
        <path d="M.5 0L.9 9M3 1L2.8 7" stroke="#ced2c8" stroke-width=".65" opacity=".48"/>
      </pattern>
      <linearGradient id="intro-skin" x2=".83" y2="1">
        <stop stop-color="#f6dcb2"/><stop offset=".73" stop-color="${skin}"/><stop offset="1" stop-color="#e8ba8d"/>
      </linearGradient>
      <linearGradient id="intro-floor" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="626" y2="719">
        <stop stop-color="white"/><stop offset="1" stop-color="black"/>
      </linearGradient>
      <mask id="intro-floor-mask" maskUnits="userSpaceOnUse" x="-240" y="-200" width="1680" height="1120">
        <rect x="-240" y="-200" width="1680" height="1120" fill="url(#intro-floor)"/>
      </mask>
      <radialGradient id="intro-wash"><stop stop-color="#f2d697" stop-opacity=".48"/><stop offset="1" stop-color="#f2d697" stop-opacity="0"/></radialGradient>
      <radialGradient id="intro-blue"><stop stop-color="#bed0dc" stop-opacity=".55"/><stop offset="1" stop-color="#bed0dc" stop-opacity="0"/></radialGradient>
      <radialGradient id="intro-glow-fill"><stop stop-color="#fffef3"/><stop offset=".36" stop-color="#fae3a4" stop-opacity=".7"/><stop offset="1" stop-color="#fae3a4" stop-opacity="0"/></radialGradient>
      <g id="intro-cap" class="ink" stroke-width="2.3">
        ${path("M-43-1Q-40 25-32 32L-7 43Q24 40 45 17L41-13Z", "#38475f")}
        ${path("M-79 4L-20-37L77-23L24 19Z", "#4c5f79")}
        ${path("M-79 4L24 19L77-23L76-17L24 25L-78 10Z", "#334158")}
        ${path("M-71 2L-19-34L69-22L23 15Z", "url(#intro-hatch)", 'stroke="none"')}
        ${detail("M-64 0L-22-29L65-21M-51 6L19 16M-34 28L-11 38M31 28L40 17", "#adb5bd", .8)}
        ${path("M-2-10Q-18 3-38 14Q-45 21-46 39", "none", 'stroke="#e4b04c" stroke-width="2.7"')}
        ${path("M-46 36Q-42 37-44 43Q-47 55-60 60Q-65 60-68 57Q-55 50-53 42Q-51 37-46 36Z", gold, 'stroke="#a87930" stroke-width="1"')}
        <ellipse cx="-2" cy="-10" rx="5.5" ry="3.5" fill="#29364a"/>
      </g>
      ${Array.from({length: 32}, (_, i) => crowdSymbol(i)).join("")}
    </defs>
    <rect x="-240" y="-200" width="1680" height="1120" fill="${paper}"/>
    <ellipse cx="535" cy="241" rx="585" ry="315" fill="url(#intro-blue)"/>
    <ellipse cx="593" cy="493" rx="642" ry="282" fill="url(#intro-wash)"/>
    ${paperMarks()}
    <g mask="url(#intro-floor-mask)">
      <g class="camera">
        ${scenery()}
        ${crowd(mobile)}
        ${character()}
        ${desk()}
        ${airborneCaps(mobile)}
      </g>
    </g>
    <g transform="translate(606 222)">
      <g data-hero-cap class="moving-part">${use("cap")}</g>
    </g>
    <ellipse data-cap-glow class="moving-part" cx="600" cy="322" rx="232" ry="168" fill="url(#intro-glow-fill)"/>
    <g data-cap-swish stroke="#8298ad" stroke-linecap="round" opacity="0">
      ${detail("M422 305Q389 245 476 191Q495 179 523 170M704 467Q793 450 812 374Q818 349 803 323M436 361Q401 331 404 302M758 403Q790 376 786 352", "#8095ab", .72)}
    </g>
  </svg>`;
}
