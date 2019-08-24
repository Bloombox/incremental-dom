/**
 * Copyright 2018 The Incremental DOM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { createMap, truncateArray } from "./util";
import { flush, queueChange } from "./changes";
/**
 * Used to keep track of the previous values when a 2-way diff is necessary.
 * This object is cleared out and reused.
 */
const prevValuesMap = createMap();
/**
 * Calculates the diff between previous and next values, calling the update
 * function when an item has changed value. If an item from the previous values
 * is not present in the the next values, the update function is called with a
 * value of `undefined`.
 * @param prev The previous values, alternating name, value pairs.
 * @param next The next values, alternating name, value pairs.
 * @param updateCtx The context for the updateFn.
 * @param updateFn A function to call when a value has changed.
 */
function calculateDiff(prev, next, updateCtx, updateFn) {
    const isNew = !prev.length;
    let i = 0;
    for (; i < next.length; i += 2) {
        const name = next[i];
        if (isNew) {
            prev[i] = name;
        }
        else if (prev[i] !== name) {
            break;
        }
        const value = next[i + 1];
        if (isNew || prev[i + 1] !== value) {
            prev[i + 1] = value;
            queueChange(updateFn, updateCtx, name, value);
        }
    }
    // Items did not line up exactly as before, need to make sure old items are
    // removed. This should be a rare case.
    if (i < next.length || i < prev.length) {
        const startIndex = i;
        for (i = startIndex; i < prev.length; i += 2) {
            prevValuesMap[prev[i]] = prev[i + 1];
        }
        for (i = startIndex; i < next.length; i += 2) {
            const name = next[i];
            const value = next[i + 1];
            if (prevValuesMap[name] !== value) {
                queueChange(updateFn, updateCtx, name, value);
            }
            prev[i] = name;
            prev[i + 1] = value;
            delete prevValuesMap[name];
        }
        truncateArray(prev, next.length);
        for (const name in prevValuesMap) {
            queueChange(updateFn, updateCtx, name, undefined);
            delete prevValuesMap[name];
        }
    }
    flush();
}
export { calculateDiff };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9kaWZmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBRUgsT0FBTyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDbEQsT0FBTyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFL0M7OztHQUdHO0FBQ0gsTUFBTSxhQUFhLEdBQUcsU0FBUyxFQUFFLENBQUM7QUFFbEM7Ozs7Ozs7OztHQVNHO0FBQ0gsU0FBUyxhQUFhLENBQ3BCLElBQW1CLEVBQ25CLElBQW1CLEVBQ25CLFNBQVksRUFDWixRQUF3RDtJQUV4RCxNQUFNLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRVYsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQzlCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEtBQUssRUFBRTtZQUNULElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDaEI7YUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDM0IsTUFBTTtTQUNQO1FBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEtBQUssRUFBRTtZQUNsQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUNwQixXQUFXLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDL0M7S0FDRjtJQUVELDJFQUEyRTtJQUMzRSx1Q0FBdUM7SUFDdkMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUN0QyxNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFFckIsS0FBSyxDQUFDLEdBQUcsVUFBVSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDNUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDdEM7UUFFRCxLQUFLLENBQUMsR0FBRyxVQUFVLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM1QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFXLENBQUM7WUFDL0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUUxQixJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEVBQUU7Z0JBQ2pDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQzthQUMvQztZQUVELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDZixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUVwQixPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM1QjtRQUVELGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWpDLEtBQUssTUFBTSxJQUFJLElBQUksYUFBYSxFQUFFO1lBQ2hDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNsRCxPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM1QjtLQUNGO0lBRUQsS0FBSyxFQUFFLENBQUM7QUFDVixDQUFDO0FBRUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgSW5jcmVtZW50YWwgRE9NIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgeyBjcmVhdGVNYXAsIHRydW5jYXRlQXJyYXkgfSBmcm9tIFwiLi91dGlsXCI7XG5pbXBvcnQgeyBmbHVzaCwgcXVldWVDaGFuZ2UgfSBmcm9tIFwiLi9jaGFuZ2VzXCI7XG5cbi8qKlxuICogVXNlZCB0byBrZWVwIHRyYWNrIG9mIHRoZSBwcmV2aW91cyB2YWx1ZXMgd2hlbiBhIDItd2F5IGRpZmYgaXMgbmVjZXNzYXJ5LlxuICogVGhpcyBvYmplY3QgaXMgY2xlYXJlZCBvdXQgYW5kIHJldXNlZC5cbiAqL1xuY29uc3QgcHJldlZhbHVlc01hcCA9IGNyZWF0ZU1hcCgpO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRpZmYgYmV0d2VlbiBwcmV2aW91cyBhbmQgbmV4dCB2YWx1ZXMsIGNhbGxpbmcgdGhlIHVwZGF0ZVxuICogZnVuY3Rpb24gd2hlbiBhbiBpdGVtIGhhcyBjaGFuZ2VkIHZhbHVlLiBJZiBhbiBpdGVtIGZyb20gdGhlIHByZXZpb3VzIHZhbHVlc1xuICogaXMgbm90IHByZXNlbnQgaW4gdGhlIHRoZSBuZXh0IHZhbHVlcywgdGhlIHVwZGF0ZSBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCBhXG4gKiB2YWx1ZSBvZiBgdW5kZWZpbmVkYC5cbiAqIEBwYXJhbSBwcmV2IFRoZSBwcmV2aW91cyB2YWx1ZXMsIGFsdGVybmF0aW5nIG5hbWUsIHZhbHVlIHBhaXJzLlxuICogQHBhcmFtIG5leHQgVGhlIG5leHQgdmFsdWVzLCBhbHRlcm5hdGluZyBuYW1lLCB2YWx1ZSBwYWlycy5cbiAqIEBwYXJhbSB1cGRhdGVDdHggVGhlIGNvbnRleHQgZm9yIHRoZSB1cGRhdGVGbi5cbiAqIEBwYXJhbSB1cGRhdGVGbiBBIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBhIHZhbHVlIGhhcyBjaGFuZ2VkLlxuICovXG5mdW5jdGlvbiBjYWxjdWxhdGVEaWZmPFQ+KFxuICBwcmV2OiBBcnJheTxzdHJpbmc+LFxuICBuZXh0OiBBcnJheTxzdHJpbmc+LFxuICB1cGRhdGVDdHg6IFQsXG4gIHVwZGF0ZUZuOiAoY3R4OiBULCB4OiBzdHJpbmcsIHk6IHt9IHwgdW5kZWZpbmVkKSA9PiB2b2lkXG4pIHtcbiAgY29uc3QgaXNOZXcgPSAhcHJldi5sZW5ndGg7XG4gIGxldCBpID0gMDtcblxuICBmb3IgKDsgaSA8IG5leHQubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBjb25zdCBuYW1lID0gbmV4dFtpXTtcbiAgICBpZiAoaXNOZXcpIHtcbiAgICAgIHByZXZbaV0gPSBuYW1lO1xuICAgIH0gZWxzZSBpZiAocHJldltpXSAhPT0gbmFtZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3QgdmFsdWUgPSBuZXh0W2kgKyAxXTtcbiAgICBpZiAoaXNOZXcgfHwgcHJldltpICsgMV0gIT09IHZhbHVlKSB7XG4gICAgICBwcmV2W2kgKyAxXSA9IHZhbHVlO1xuICAgICAgcXVldWVDaGFuZ2UodXBkYXRlRm4sIHVwZGF0ZUN0eCwgbmFtZSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEl0ZW1zIGRpZCBub3QgbGluZSB1cCBleGFjdGx5IGFzIGJlZm9yZSwgbmVlZCB0byBtYWtlIHN1cmUgb2xkIGl0ZW1zIGFyZVxuICAvLyByZW1vdmVkLiBUaGlzIHNob3VsZCBiZSBhIHJhcmUgY2FzZS5cbiAgaWYgKGkgPCBuZXh0Lmxlbmd0aCB8fCBpIDwgcHJldi5sZW5ndGgpIHtcbiAgICBjb25zdCBzdGFydEluZGV4ID0gaTtcblxuICAgIGZvciAoaSA9IHN0YXJ0SW5kZXg7IGkgPCBwcmV2Lmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICBwcmV2VmFsdWVzTWFwW3ByZXZbaV1dID0gcHJldltpICsgMV07XG4gICAgfVxuXG4gICAgZm9yIChpID0gc3RhcnRJbmRleDsgaSA8IG5leHQubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBuZXh0W2ldIGFzIHN0cmluZztcbiAgICAgIGNvbnN0IHZhbHVlID0gbmV4dFtpICsgMV07XG5cbiAgICAgIGlmIChwcmV2VmFsdWVzTWFwW25hbWVdICE9PSB2YWx1ZSkge1xuICAgICAgICBxdWV1ZUNoYW5nZSh1cGRhdGVGbiwgdXBkYXRlQ3R4LCBuYW1lLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHByZXZbaV0gPSBuYW1lO1xuICAgICAgcHJldltpICsgMV0gPSB2YWx1ZTtcblxuICAgICAgZGVsZXRlIHByZXZWYWx1ZXNNYXBbbmFtZV07XG4gICAgfVxuXG4gICAgdHJ1bmNhdGVBcnJheShwcmV2LCBuZXh0Lmxlbmd0aCk7XG5cbiAgICBmb3IgKGNvbnN0IG5hbWUgaW4gcHJldlZhbHVlc01hcCkge1xuICAgICAgcXVldWVDaGFuZ2UodXBkYXRlRm4sIHVwZGF0ZUN0eCwgbmFtZSwgdW5kZWZpbmVkKTtcbiAgICAgIGRlbGV0ZSBwcmV2VmFsdWVzTWFwW25hbWVdO1xuICAgIH1cbiAgfVxuXG4gIGZsdXNoKCk7XG59XG5cbmV4cG9ydCB7IGNhbGN1bGF0ZURpZmYgfTtcbiJdfQ==