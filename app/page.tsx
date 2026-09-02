import Link from "next/link";
import {getSummaryForMonth} from "@/lib/actions/meals";
import {getMembers} from "@/lib/actions/members";
import {getRestaurants} from "@/lib/actions/restaurants";
import {RegisterMealForm} from "@/components/register-meal-form";

const won = (n: number) => `${n.toLocaleString()}원`;
const label = (m: string) => {
  const [y, mo] = m.split("-");
  return `${y}년 ${Number(mo)}월`;
};

export default async function Home() {
  const month = new Date().toISOString().slice(0, 7);
  const [summary, members, restaurants] = await Promise.all([
    getSummaryForMonth(month),
    getMembers(),
    getRestaurants(),
  ]);

  // 1. 화면 표시용: 맨 앞 숫자만 제거하는 함수 (예: "1KDC" -> "KDC")
  const cleanName = (name: string) => name.replace(/^[0-9]+/, "");

  // 2. 숫자를 기준으로 오름차순 정렬 (1KDC -> 2CSB -> 3PJW -> 4JSH -> 5KJM 순)
  const sortedPerMember = [...summary.perMember].sort((a, b) => {
    const numA = parseInt(a.name.match(/^[0-9]+/)?.[0] || "999", 10);
    const numB = parseInt(b.name.match(/^[0-9]+/)?.[0] || "999", 10);
    return numA - numB;
  });

  return (
    <main className="py-7">
      <div className="container-app space-y-5">
        <header>
          <div className="text-sm font-semibold text-[#7b4dff]">
            LUNCH EXPENSE REPORT
          </div>
          <h1 className="text-3xl font-black mt-1">점심식사비 리포트</h1>
          <p className="text-sm text-gray-500 mt-1">{label(month)} 기준</p>
        </header>
        <nav className="flex gap-2 flex-wrap">
          <Link className="btn btn-secondary" href="/">
            요약
          </Link>
          <Link className="btn btn-secondary" href="/records">
            식사기록
          </Link>
          <Link className="btn btn-secondary" href="/members">
            구성원
          </Link>
          <Link className="btn btn-secondary" href="/restaurants">
            식당
          </Link>
        </nav>
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ["총 식사비", won(summary.totalAmount)],
            ["식사 횟수", `${summary.mealCount}회`],
            ["회당 평균", won(summary.avgPerMeal)],
            ["1인 평균", won(summary.avgPerPerson)],
          ].map(([l, v]) => (
            <div key={l} className="card p-4">
              <div className="text-xs text-gray-500">{l}</div>
              <div className="text-xl font-black mt-2">{v}</div>
            </div>
          ))}
        </section>
        <RegisterMealForm members={members} restaurants={restaurants} />
        <section className="card p-4">
          <h2 className="font-bold">구성원별 분담 현황</h2>
          <div className="mt-3 divide-y">
            {sortedPerMember.map((m) => (
              <div key={m.id} className="py-3 flex justify-between">
                <div>
                  {/* 정렬은 숫자로 하되, 화면에는 숫자 없이 표기 */}
                  <b>{cleanName(m.name)}</b>
                  <div className="text-xs text-gray-500">
                    {m.position ?? ""} · {m.count}회
                  </div>
                </div>
                <b>{won(m.totalAmount)}</b>
              </div>
            ))}
          </div>
        </section>
        <section className="card p-4">
          <h2 className="font-bold">최근 식사</h2>
          <div className="mt-3 divide-y">
            {summary.recentRecords.map((r) => (
              <div key={r.id} className="py-3 flex justify-between gap-3">
                <div>
                  <b>{r.restaurantName ?? "알수없음"}</b>
                  <div className="text-xs text-gray-500">
                    {r.mealDate} ·{" "}
                    {r.participants.map((p) => cleanName(p.name)).join(", ")}
                  </div>
                </div>
                <b>{won(r.totalAmount)}</b>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
