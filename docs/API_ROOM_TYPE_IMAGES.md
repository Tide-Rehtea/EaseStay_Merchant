# 房型图片字段 - 接口与数据格式说明

本文档说明房型（room_type）新增的 `images` 字段，供管理员端、用户端对接使用。

---

## 一、数据结构变更

### 1. 房型（RoomType）结构

**之前：**
```typescript
interface RoomType {
  type: string;        // 房型名称
  price: number;       // 价格（元/晚）
  facilities?: string[];  // 房内设施
  description?: string;   // 房型描述
}
```

**现在（新增 images）：**
```typescript
interface RoomType {
  type: string;
  price: number;
  facilities?: string[];
  description?: string;
  images?: string[];   // 房型图片，每个房型最多 5 张
}
```

### 2. 图片 URL 格式

- 存储格式：相对路径，如 `/uploads/xxx.jpg`
- 展示时需拼接域名：`${API_BASE}${path}` 或 `${IMAGE_BASE}${path}`
- 若 URL 已以 `http` 开头，则直接使用

---

## 二、酒店完整数据结构

### 创建/更新酒店请求体（POST/PUT /api/hotels 或 /api/hotels/:id）

```json
{
  "name": "酒店名称",
  "name_en": "Hotel Name",
  "address": "详细地址",
  "star": 5,
  "room_type": [
    {
      "type": "标准大床房",
      "price": 399,
      "facilities": ["wifi", "tv", "ac"],
      "description": "25平米，海景房",
      "images": ["/uploads/room1-1.jpg", "/uploads/room1-2.jpg"]
    },
    {
      "type": "豪华套房",
      "price": 899,
      "facilities": ["wifi", "tv", "ac", "bathtub"],
      "description": "45平米，带浴缸",
      "images": ["/uploads/room2-1.jpg"]
    }
  ],
  "price": 399,
  "open_date": "2024-01-01",
  "tags": ["海景", "亲子"],
  "facilities": ["泳池", "健身房"],
  "nearby_attractions": "附近景点",
  "discount": 0.9,
  "discount_description": "会员9折",
  "images": ["/uploads/hotel1.jpg", "/uploads/hotel2.jpg"]
}
```

### 酒店响应体（GET /api/hotels/:id 等）

```json
{
  "success": true,
  "data": {
    "hotel": {
      "id": 1,
      "name": "酒店名称",
      "name_en": "Hotel Name",
      "address": "详细地址",
      "star": 5,
      "room_type": [
        {
          "type": "标准大床房",
          "price": 399,
          "facilities": ["wifi", "tv", "ac"],
          "description": "25平米，海景房",
          "images": ["/uploads/room1-1.jpg", "/uploads/room1-2.jpg"]
        }
      ],
      "price": 399,
      "open_date": "2024-01-01",
      "images": ["/uploads/hotel1.jpg"],
      "tags": ["海景"],
      "facilities": ["泳池"],
      "nearby_attractions": null,
      "discount": null,
      "discount_description": null,
      "review_status": "approved",
      "publish_status": "published",
      "reject_reason": null,
      "merchant_id": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "merchant": { "id": 1, "email": "merchant@example.com" }
    }
  }
}
```

---

## 三、接口列表（与房型相关）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/hotels` | 创建酒店，`room_type` 中可含 `images` |
| PUT | `/api/hotels/:id` | 更新酒店，`room_type` 中可含 `images` |
| GET | `/api/hotels/:id` | 获取酒店详情，返回含 `images` 的 `room_type` |
| GET | `/api/hotels/my-hotels` | 商户酒店列表，每项 `room_type` 含 `images` |
| GET | `/api/admin/hotels` | 管理员全部酒店，同上 |
| GET | `/api/admin/hotels/pending` | 待审核酒店，同上 |

**图片上传接口（房型与酒店共用）：**

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/upload/image` | 单张上传，FormData 字段 `image`，返回 `{ url: "/uploads/xxx.jpg" }` |
| POST | `/api/upload/images` | 多张上传，FormData 字段 `images`（可多次） |

---

## 四、校验规则

- `room_type[].images`：可选，默认 `[]`
- 每个房型最多 5 张图片
- 图片 URL 必须以 `/uploads/` 开头

---

## 五、前端展示建议

1. **管理员端 / 商户端**：在房型编辑处增加图片上传，每个房型独立上传，最多 5 张。
2. **用户端**：在房型卡片中展示 `room.images`，可做缩略图或轮播。
3. **兼容旧数据**：若 `room.images` 为 `undefined` 或空数组，按无图片处理即可。

---

## 六、后端需配合的修改

1. 数据库：在房型表或 JSON 字段中增加 `images` 存储。
2. 创建/更新接口：接收并校验 `room_type[].images`。
3. 查询接口：返回 `room_type` 时包含 `images` 字段。
