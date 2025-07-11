"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistinctWorkItemListFromPRs = exports.getWorkItem = void 0;
function getWorkItem(workItemId, apiUrl, project, accessToken) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${apiUrl}/${project}/_apis/wit/workitems/${workItemId}?api-version=7.1&$expand=ALL`;
        console.log(`Fetching work item ${workItemId} from ${url}`);
        try {
            const response = yield fetch(url, {
                headers: {
                    'Authorization': accessToken,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errorText = yield response.text();
                console.warn(`Failed to fetch work item ${workItemId}: ${response.status} ${response.statusText}. Response: ${errorText}`);
                return null;
            }
            console.log(`Response status for WorkItem ${workItemId}: ${response.status} ${response.statusText}`);
            const data = yield response.json();
            // Validate required fields
            if (!((_a = data.fields) === null || _a === void 0 ? void 0 : _a["System.Title"]) || !((_b = data.fields) === null || _b === void 0 ? void 0 : _b["System.WorkItemType"])) {
                console.warn(`Work item ${workItemId} missing required fields`);
                return null;
            }
            // printJson(data);
            const workItem = {
                id: data.id,
                title: data.fields["System.Title"],
                description: data.fields["System.Description"] || '',
                workItemType: data.fields["System.WorkItemType"],
                url: ((_d = (_c = data._links) === null || _c === void 0 ? void 0 : _c.html) === null || _d === void 0 ? void 0 : _d.href) || data.url,
                assignedTo: data.fields["System.AssignedTo"] ? {
                    displayName: data.fields["System.AssignedTo"].displayName || 'Unassigned',
                    uniqueName: data.fields["System.AssignedTo"].uniqueName || '',
                    imageUrl: data.fields["System.AssignedTo"].imageUrl || ''
                } : {
                    displayName: 'Unassigned',
                    uniqueName: '',
                    imageUrl: ''
                }
            };
            return workItem;
        }
        catch (error) {
            console.error(`Error fetching work item ${workItemId}: ${error}`);
            return null;
        }
    });
}
exports.getWorkItem = getWorkItem;
function getDistinctWorkItemListFromPRs(prs) {
    const workItemMap = new Map();
    for (const pr of prs) {
        for (const workItem of pr.workItems || []) {
            if (!workItemMap.has(workItem.id)) {
                workItemMap.set(workItem.id, {
                    id: workItem.id,
                    title: workItem.title,
                    description: workItem.description || '',
                    workItemType: workItem.workItemType,
                    url: workItem.url,
                    assignedTo: workItem.assignedTo,
                    pullRequests: [pr]
                });
            }
            else {
                const wiList = workItemMap.get(workItem.id);
                if (!wiList.pullRequests.some(existingPr => existingPr.id === pr.id)) {
                    wiList.pullRequests.push(pr);
                }
            }
        }
    }
    return Array.from(workItemMap.values());
}
exports.getDistinctWorkItemListFromPRs = getDistinctWorkItemListFromPRs;
