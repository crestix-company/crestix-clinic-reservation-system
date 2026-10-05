import type { Patient } from "@/types/domain";
import { CLINIC_ID } from "./clinics";

/**
 * All patient data below is entirely fictional, generated for UI demo
 * purposes only. No real patient information is used anywhere in this
 * project.
 */

const LAST_NAME_KANA: Record<string, string> = {
  山田: "ヤマダ",
  佐藤: "サトウ",
  鈴木: "スズキ",
  高橋: "タカハシ",
  田中: "タナカ",
  伊藤: "イトウ",
  渡辺: "ワタナベ",
  中村: "ナカムラ",
  小林: "コバヤシ",
  加藤: "カトウ",
  吉田: "ヨシダ",
  山本: "ヤマモト",
  斎藤: "サイトウ",
  松本: "マツモト",
  井上: "イノウエ",
  木村: "キムラ",
  林: "ハヤシ",
  清水: "シミズ",
  山口: "ヤマグチ",
  森: "モリ",
  池田: "イケダ",
  橋本: "ハシモト",
  石川: "イシカワ",
  前田: "マエダ",
  藤田: "フジタ",
  後藤: "ゴトウ",
  近藤: "コンドウ",
  村上: "ムラカミ",
  遠藤: "エンドウ",
  岡田: "オカダ",
};

const FIRST_NAME_KANA: Record<string, string> = {
  太郎: "タロウ",
  一郎: "イチロウ",
  健: "ケン",
  翔: "ショウ",
  大輔: "ダイスケ",
  直樹: "ナオキ",
  浩: "ヒロシ",
  剛: "ツヨシ",
  誠: "マコト",
  学: "マナブ",
  聡: "サトシ",
  修: "オサム",
  隆: "タカシ",
  洋介: "ヨウスケ",
  拓也: "タクヤ",
  花子: "ハナコ",
  美咲: "ミサキ",
  由美: "ユミ",
  陽子: "ヨウコ",
  麻衣: "マイ",
  さくら: "サクラ",
  愛: "アイ",
  恵: "メグミ",
  香織: "カオリ",
  真由美: "マユミ",
  智子: "トモコ",
  久美子: "クミコ",
  里奈: "リナ",
  千尋: "チヒロ",
  奈々: "ナナ",
};

const LAST_NAMES = Object.keys(LAST_NAME_KANA);
const MALE_FIRST_NAMES = ["太郎", "一郎", "健", "翔", "大輔", "直樹", "浩", "剛", "誠", "学", "聡", "修", "隆", "洋介", "拓也"];
const FEMALE_FIRST_NAMES = ["花子", "美咲", "由美", "陽子", "麻衣", "さくら", "愛", "恵", "香織", "真由美", "智子", "久美子", "里奈", "千尋", "奈々"];

function phoneFor(index: number): string {
  const n = 1000 + index;
  return `080-${String(n).padStart(4, "0")}-${String((n * 7) % 10000).padStart(4, "0")}`;
}

function birthDateFor(index: number): string {
  const year = 1945 + ((index * 3) % 60); // ages roughly 20-80 as of 2026
  const month = 1 + (index % 12);
  const day = 1 + ((index * 5) % 27);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

let autoSeq = 0;
function makePatient(lastName: string, firstName: string, gender: "M" | "F"): Patient {
  autoSeq += 1;
  const kanaLast = LAST_NAME_KANA[lastName] ?? "";
  const kanaFirst = FIRST_NAME_KANA[firstName] ?? "";
  return {
    id: `pt-${String(autoSeq).padStart(4, "0")}`,
    clinicId: CLINIC_ID,
    name: `${lastName}${firstName}`,
    kana: `${kanaLast} ${kanaFirst}`,
    phone: phoneFor(autoSeq),
    birthDate: birthDateFor(autoSeq + (gender === "F" ? 11 : 0)),
  };
}

/**
 * Explicitly named patients referenced directly by the demo sample rows
 * shown in the spec (dashboard table, reception queue, etc).
 */
export const NAMED_PATIENTS = {
  yamadaTaro: makePatient("山田", "太郎", "M"),
  satoHanako: makePatient("佐藤", "花子", "F"),
  suzukiIchiro: makePatient("鈴木", "一郎", "M"),
  takahashiMisaki: makePatient("高橋", "美咲", "F"),
  tanakaKen: makePatient("田中", "健", "M"),
  itoMisaki: makePatient("伊藤", "美咲", "F"),
  kimuraSho: makePatient("木村", "翔", "M"),
  tanakaTaro: makePatient("田中", "太郎", "M"),
  yamadaHanako: makePatient("山田", "花子", "F"),
  satoTaro: makePatient("佐藤", "太郎", "M"),
  suzukiHanako: makePatient("鈴木", "花子", "F"),
  takahashiIchiro: makePatient("高橋", "一郎", "M"),
};

// Enumerate every (lastName, firstName) combination exhaustively (first
// name varies slowest) so we get up to LAST_NAMES.length * firstPool.length
// unique combos per gender, instead of a naive stride that cycles through
// only a handful of pairs and repeats early.
function allCombos(firstPool: string[]): { lastName: string; firstName: string }[] {
  const combos: { lastName: string; firstName: string }[] = [];
  for (const firstName of firstPool) {
    for (const lastName of LAST_NAMES) {
      combos.push({ lastName, firstName });
    }
  }
  return combos;
}

// Avoid regenerating the same full name as one of the NAMED_PATIENTS above
// (e.g. "山田太郎") — duplicate patient names in the reservation table read
// as broken data in a demo, even though the underlying patient IDs differ.
const usedFullNames = new Set(Object.values(NAMED_PATIENTS).map((p) => p.name));
const maleCombos = allCombos(MALE_FIRST_NAMES);
const femaleCombos = allCombos(FEMALE_FIRST_NAMES);
const extraPatients: Patient[] = [];
for (let i = 0; extraPatients.length < 90 && i < Math.max(maleCombos.length, femaleCombos.length); i += 1) {
  for (const [combos, gender] of [
    [maleCombos, "M"],
    [femaleCombos, "F"],
  ] as const) {
    if (i >= combos.length) continue;
    const { lastName, firstName } = combos[i];
    const fullName = `${lastName}${firstName}`;
    if (usedFullNames.has(fullName)) continue;
    usedFullNames.add(fullName);
    extraPatients.push(makePatient(lastName, firstName, gender));
  }
}

export const patients: Patient[] = [...Object.values(NAMED_PATIENTS), ...extraPatients];

/**
 * Patients used to fill generated reservations that aren't one of the
 * explicitly named sample rows. Kept separate from `patients` so the
 * generator in reservations.ts never wraps back around into
 * NAMED_PATIENTS and accidentally double-books a named sample patient.
 */
export const fillerPatients: Patient[] = extraPatients;

export function getPatientById(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}
