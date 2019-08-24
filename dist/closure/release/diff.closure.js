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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3JlbGVhc2UvZGlmZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUVILE9BQU8sRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQ2xELE9BQU8sRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRS9DOzs7R0FHRztBQUNILE1BQU0sYUFBYSxHQUFHLFNBQVMsRUFBRSxDQUFDO0FBRWxDOzs7Ozs7Ozs7R0FTRztBQUNILFNBQVMsYUFBYSxDQUNwQixJQUFtQixFQUNuQixJQUFtQixFQUNuQixTQUFZLEVBQ1osUUFBd0Q7SUFFeEQsTUFBTSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVWLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUM5QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxLQUFLLEVBQUU7WUFDVCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1NBQ2hCO2FBQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQzNCLE1BQU07U0FDUDtRQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUIsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUU7WUFDbEMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDcEIsV0FBVyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQy9DO0tBQ0Y7SUFFRCwyRUFBMkU7SUFDM0UsdUNBQXVDO0lBQ3ZDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDdEMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBRXJCLEtBQUssQ0FBQyxHQUFHLFVBQVUsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzVDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ3RDO1FBRUQsS0FBSyxDQUFDLEdBQUcsVUFBVSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDNUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBVyxDQUFDO1lBQy9CLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFMUIsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxFQUFFO2dCQUNqQyxXQUFXLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDL0M7WUFFRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ2YsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7WUFFcEIsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDNUI7UUFFRCxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVqQyxLQUFLLE1BQU0sSUFBSSxJQUFJLGFBQWEsRUFBRTtZQUNoQyxXQUFXLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDbEQsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDNUI7S0FDRjtJQUVELEtBQUssRUFBRSxDQUFDO0FBQ1YsQ0FBQztBQUVELE9BQU8sRUFBRSxhQUFhLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTggVGhlIEluY3JlbWVudGFsIERPTSBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHsgY3JlYXRlTWFwLCB0cnVuY2F0ZUFycmF5IH0gZnJvbSBcIi4vdXRpbFwiO1xuaW1wb3J0IHsgZmx1c2gsIHF1ZXVlQ2hhbmdlIH0gZnJvbSBcIi4vY2hhbmdlc1wiO1xuXG4vKipcbiAqIFVzZWQgdG8ga2VlcCB0cmFjayBvZiB0aGUgcHJldmlvdXMgdmFsdWVzIHdoZW4gYSAyLXdheSBkaWZmIGlzIG5lY2Vzc2FyeS5cbiAqIFRoaXMgb2JqZWN0IGlzIGNsZWFyZWQgb3V0IGFuZCByZXVzZWQuXG4gKi9cbmNvbnN0IHByZXZWYWx1ZXNNYXAgPSBjcmVhdGVNYXAoKTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkaWZmIGJldHdlZW4gcHJldmlvdXMgYW5kIG5leHQgdmFsdWVzLCBjYWxsaW5nIHRoZSB1cGRhdGVcbiAqIGZ1bmN0aW9uIHdoZW4gYW4gaXRlbSBoYXMgY2hhbmdlZCB2YWx1ZS4gSWYgYW4gaXRlbSBmcm9tIHRoZSBwcmV2aW91cyB2YWx1ZXNcbiAqIGlzIG5vdCBwcmVzZW50IGluIHRoZSB0aGUgbmV4dCB2YWx1ZXMsIHRoZSB1cGRhdGUgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggYVxuICogdmFsdWUgb2YgYHVuZGVmaW5lZGAuXG4gKiBAcGFyYW0gcHJldiBUaGUgcHJldmlvdXMgdmFsdWVzLCBhbHRlcm5hdGluZyBuYW1lLCB2YWx1ZSBwYWlycy5cbiAqIEBwYXJhbSBuZXh0IFRoZSBuZXh0IHZhbHVlcywgYWx0ZXJuYXRpbmcgbmFtZSwgdmFsdWUgcGFpcnMuXG4gKiBAcGFyYW0gdXBkYXRlQ3R4IFRoZSBjb250ZXh0IGZvciB0aGUgdXBkYXRlRm4uXG4gKiBAcGFyYW0gdXBkYXRlRm4gQSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gYSB2YWx1ZSBoYXMgY2hhbmdlZC5cbiAqL1xuZnVuY3Rpb24gY2FsY3VsYXRlRGlmZjxUPihcbiAgcHJldjogQXJyYXk8c3RyaW5nPixcbiAgbmV4dDogQXJyYXk8c3RyaW5nPixcbiAgdXBkYXRlQ3R4OiBULFxuICB1cGRhdGVGbjogKGN0eDogVCwgeDogc3RyaW5nLCB5OiB7fSB8IHVuZGVmaW5lZCkgPT4gdm9pZFxuKSB7XG4gIGNvbnN0IGlzTmV3ID0gIXByZXYubGVuZ3RoO1xuICBsZXQgaSA9IDA7XG5cbiAgZm9yICg7IGkgPCBuZXh0Lmxlbmd0aDsgaSArPSAyKSB7XG4gICAgY29uc3QgbmFtZSA9IG5leHRbaV07XG4gICAgaWYgKGlzTmV3KSB7XG4gICAgICBwcmV2W2ldID0gbmFtZTtcbiAgICB9IGVsc2UgaWYgKHByZXZbaV0gIT09IG5hbWUpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlID0gbmV4dFtpICsgMV07XG4gICAgaWYgKGlzTmV3IHx8IHByZXZbaSArIDFdICE9PSB2YWx1ZSkge1xuICAgICAgcHJldltpICsgMV0gPSB2YWx1ZTtcbiAgICAgIHF1ZXVlQ2hhbmdlKHVwZGF0ZUZuLCB1cGRhdGVDdHgsIG5hbWUsIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICAvLyBJdGVtcyBkaWQgbm90IGxpbmUgdXAgZXhhY3RseSBhcyBiZWZvcmUsIG5lZWQgdG8gbWFrZSBzdXJlIG9sZCBpdGVtcyBhcmVcbiAgLy8gcmVtb3ZlZC4gVGhpcyBzaG91bGQgYmUgYSByYXJlIGNhc2UuXG4gIGlmIChpIDwgbmV4dC5sZW5ndGggfHwgaSA8IHByZXYubGVuZ3RoKSB7XG4gICAgY29uc3Qgc3RhcnRJbmRleCA9IGk7XG5cbiAgICBmb3IgKGkgPSBzdGFydEluZGV4OyBpIDwgcHJldi5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgcHJldlZhbHVlc01hcFtwcmV2W2ldXSA9IHByZXZbaSArIDFdO1xuICAgIH1cblxuICAgIGZvciAoaSA9IHN0YXJ0SW5kZXg7IGkgPCBuZXh0Lmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICBjb25zdCBuYW1lID0gbmV4dFtpXSBhcyBzdHJpbmc7XG4gICAgICBjb25zdCB2YWx1ZSA9IG5leHRbaSArIDFdO1xuXG4gICAgICBpZiAocHJldlZhbHVlc01hcFtuYW1lXSAhPT0gdmFsdWUpIHtcbiAgICAgICAgcXVldWVDaGFuZ2UodXBkYXRlRm4sIHVwZGF0ZUN0eCwgbmFtZSwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBwcmV2W2ldID0gbmFtZTtcbiAgICAgIHByZXZbaSArIDFdID0gdmFsdWU7XG5cbiAgICAgIGRlbGV0ZSBwcmV2VmFsdWVzTWFwW25hbWVdO1xuICAgIH1cblxuICAgIHRydW5jYXRlQXJyYXkocHJldiwgbmV4dC5sZW5ndGgpO1xuXG4gICAgZm9yIChjb25zdCBuYW1lIGluIHByZXZWYWx1ZXNNYXApIHtcbiAgICAgIHF1ZXVlQ2hhbmdlKHVwZGF0ZUZuLCB1cGRhdGVDdHgsIG5hbWUsIHVuZGVmaW5lZCk7XG4gICAgICBkZWxldGUgcHJldlZhbHVlc01hcFtuYW1lXTtcbiAgICB9XG4gIH1cblxuICBmbHVzaCgpO1xufVxuXG5leHBvcnQgeyBjYWxjdWxhdGVEaWZmIH07XG4iXX0=