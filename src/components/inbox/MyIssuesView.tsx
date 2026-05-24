"use client";

import { useMemo, useState } from "react";
import { CircleUser } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { RequestList } from "./RequestList";
import { RequestDetail } from "./RequestDetail";
import { EmptyState } from "@/components/ui/EmptyState";
import { useInboxStore } from "@/store/useInboxStore";
import { buildDisplayIdMap } from "@/lib/format";
import { DEMO_WORKSPACE } from "@/lib/constants";
import type { RequestStatus } from "@/types";

export function MyIssuesView() {
  const [openId, setOpenId] = useState<string | null>(null);

  const {
    requests,
    selectedIds,
    focusedId,
    setFocusedId,
    setStatus,
    setTags,
    toggleSelectId,
  } = useInboxStore();

  const myRequests = useMemo(
    () => requests.filter((r) => r.submittedBy === DEMO_WORKSPACE.currentUser.name),
    [requests],
  );

  const displayIdMap = useMemo(() => buildDisplayIdMap(requests), [requests]);
  const openRequest = openId ? requests.find((r) => r.id === openId) ?? null : null;
  const hasDetail = openRequest !== null;

  function handleOpen(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  function handleStatusChange(id: string, status: RequestStatus) {
    setStatus(id, status);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="My Issues" />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <div
          className="flex flex-col overflow-hidden transition-all duration-200"
          style={{ flex: hasDetail ? "0 0 55%" : "1 1 0%" }}
        >
          {myRequests.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                Icon={CircleUser}
                title="No issues here"
                description={`Requests submitted by ${DEMO_WORKSPACE.currentUser.name} will appear here.`}
              />
            </div>
          ) : (
            <RequestList
              allRequests={requests}
              filteredRequests={myRequests}
              activeTab="all"
              openId={openId}
              checkedIds={selectedIds}
              focusedId={focusedId}
              onOpen={handleOpen}
              onCheck={toggleSelectId}
              onStatusChange={handleStatusChange}
              onFocus={setFocusedId}
            />
          )}
        </div>

        {hasDetail && openRequest && (
          <div
            className="flex flex-col overflow-hidden"
            style={{ flex: "0 0 45%" }}
          >
            <RequestDetail
              request={openRequest}
              displayId={displayIdMap[openRequest.id] ?? "KEL-???"}
              onClose={() => setOpenId(null)}
              onStatusChange={handleStatusChange}
              onTagsChange={setTags}
            />
          </div>
        )}
      </div>
    </div>
  );
}
