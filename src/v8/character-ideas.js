export const CHARACTER_IDEAS=[
 {id:'starlight',label:'星際旅人',name:'星瀾',concept:'在星際小鎮收集遺失願望的信使，想替每個陌生人找到歸途。',appearance:'銀藍短髮、琥珀眼睛、深藍機能外套、發光星軌掛飾',personality:'curious',style:'anime',sprite:'red_normal',keywords:/星|宇宙|月|天空|旅行|旅人|太空/i},
 {id:'forest',label:'森林夥伴',name:'葉鈴',concept:'能聽懂小動物心聲的森林郵差，帶著信件探索世界。',appearance:'栗色蓬鬆短髮、金色眼睛、苔綠色披肩、小鈴鐺背包',personality:'gentle',style:'painterly',sprite:'green_normal',keywords:/猫|狗|动物|森林|树|自然|花|冒险/i},
 {id:'city',label:'城市旋律',name:'律音',concept:'記錄城市聲音的年輕音樂人，用節奏連接陌生人的故事。',appearance:'深灰短髮、青檸髮夾、黑白機能外套、腰間錄音器',personality:'playful',style:'techwear',sprite:'boy',keywords:/城市|音乐|节奏|声音|街|舞|唱/i},
 {id:'mystery',label:'奇妙偵探',name:'墨禾',concept:'在小鎮追尋溫柔謎題的見習偵探，總能發現被忽略的線索。',appearance:'黑色短捲髮、青綠眼睛、深棕短風衣、銅色線索徽章',personality:'calm',style:'comicink',sprite:'lass',keywords:/侦探|谜|秘密|线索|推理|书/i}
];

export function completeCharacterDraft(input={},selection='auto',sequence=0){
 const authored=[input.name,input.concept,input.appearance].filter(Boolean).join(' ');
 const idea=CHARACTER_IDEAS.find(x=>x.id===selection)||CHARACTER_IDEAS.find(x=>x.keywords.test(authored))||CHARACTER_IDEAS[sequence%CHARACTER_IDEAS.length];
 const appearance=String(input.appearance||'').trim();
 return {...input,name:String(input.name||'').trim()||idea.name,concept:String(input.concept||'').trim()||idea.concept,appearance:appearance||idea.appearance,personality:input.personality||idea.personality,style:input.style||idea.style,sprite:input.sprite||idea.sprite,artDirection:input.artDirection||'sevnzel',avatar:input.avatar||'assets/ocworld/sevnzel-test-v1.png',imageSource:input.imageSource||'preset',ideaId:idea.id};
}
