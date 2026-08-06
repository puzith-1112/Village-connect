import { User, Job, Agriculture, Healthcare, Education, Grievance } from "./models.js";
const modelMap = {
  users: User,
  jobs: Job,
  agriculture: Agriculture,
  healthcare: Healthcare,
  education: Education,
  grievances: Grievance
};
const usersTable = { tableName: "users", model: User };
const jobsTable = { tableName: "jobs", model: Job };
const agricultureTable = { tableName: "agriculture", model: Agriculture };
const healthcareTable = { tableName: "healthcare", model: Healthcare };
const educationTable = { tableName: "education", model: Education };
const grievancesTable = { tableName: "grievances", model: Grievance };
function createColumn(table, name) {
  return { kind: "column", table, name };
}
const tableSchemas = {
  users: ["id", "name", "email", "password", "role", "skills", "interests", "experience", "employmentStatus", "currentJobId", "createdAt", "updatedAt"],
  jobs: ["id", "title", "description", "location", "salary", "skillsRequired", "duration", "postedBy", "status", "createdAt", "updatedAt"],
  agriculture: ["id", "tips", "schemes", "title", "category", "content", "imageUrl", "createdAt", "updatedAt"],
  healthcare: ["id", "information", "services", "title", "category", "content", "contactInfo", "imageUrl", "createdAt", "updatedAt"],
  education: ["id", "resources", "courses", "title", "category", "content", "link", "imageUrl", "createdAt", "updatedAt"],
  grievances: ["id", "userId", "title", "description", "status", "adminResponse", "createdAt", "updatedAt"]
};
const tableObjects = { usersTable, jobsTable, agricultureTable, healthcareTable, educationTable, grievancesTable };
Object.entries(tableSchemas).forEach(([tableName, columns]) => {
  const tableObj = Object.values(tableObjects).find((t) => t.tableName === tableName);
  if (tableObj) {
    columns.forEach((col) => {
      tableObj[col] = createColumn(tableName, col);
    });
  }
});
function eq(column, value) {
  return { kind: "eq", column, value };
}
function ilike(column, value) {
  return { kind: "ilike", column, value };
}
function and(...conditions) {
  return { kind: "and", conditions: conditions.filter(Boolean) };
}
function or(...conditions) {
  return { kind: "or", conditions: conditions.filter(Boolean) };
}
function desc(column) {
  return { kind: "desc", column, direction: "desc" };
}
function count() {
  return { kind: "count" };
}
function getMongoFieldName(columnName) {
  return columnName === "id" ? "_id" : columnName;
}
function isColumn(value) {
  return value?.kind === "column";
}
function buildMongoQuery(condition) {
  if (!condition) return {};
  switch (condition.kind) {
    case "eq": {
      if (!isColumn(condition.column) || isColumn(condition.value)) {
        return {};
      }
      const field = getMongoFieldName(condition.column.name);
      return { [field]: condition.value };
    }
    case "ilike": {
      if (!isColumn(condition.column)) {
        return {};
      }
      const field = getMongoFieldName(condition.column.name);
      const pattern = condition.value.replace(/%/g, "");
      return { [field]: { $regex: pattern, $options: "i" } };
    }
    case "and": {
      const queries = condition.conditions.map((c) => buildMongoQuery(c)).filter((q) => Object.keys(q).length > 0);
      return queries.length > 0 ? { $and: queries } : {};
    }
    case "or": {
      const queries = condition.conditions.map((c) => buildMongoQuery(c)).filter((q) => Object.keys(q).length > 0);
      return queries.length > 0 ? { $or: queries } : {};
    }
    default:
      return {};
  }
}
function getModel(table) {
  return table.model;
}
function getColumnValue(doc, column) {
  if (!doc || !column) return null;
  const field = getMongoFieldName(column.name);
  return doc[field] ?? null;
}
class SelectQuery {
  constructor(selection) {
    this.selection = selection;
    this.baseTable = null;
    this.joinTable = null;
    this.joinCondition = null;
    this.whereCondition = null;
    this.ordering = null;
    this.limitValue = void 0;
    this.offsetValue = 0;
  }
  from(table) {
    this.baseTable = table;
    return this;
  }
  leftJoin(table, condition) {
    this.joinTable = table;
    this.joinCondition = condition;
    return this;
  }
  where(condition) {
    this.whereCondition = condition;
    return this;
  }
  orderBy(ordering) {
    this.ordering = ordering;
    return this;
  }
  limit(value) {
    this.limitValue = value;
    return this;
  }
  offset(value) {
    this.offsetValue = value;
    return this;
  }
  $dynamic() {
    return this;
  }
  async execute() {
    const model = getModel(this.baseTable);
    const query = buildMongoQuery(this.whereCondition);
    let mongoQuery = model.find(query);
    if (this.ordering) {
      const field = this.ordering.column.name;
      mongoQuery = mongoQuery.sort({ [field]: this.ordering.direction === "desc" ? -1 : 1 });
    }
    if (this.offsetValue > 0) {
      mongoQuery = mongoQuery.skip(this.offsetValue);
    }
    if (this.limitValue !== void 0) {
      mongoQuery = mongoQuery.limit(this.limitValue);
    }
    const results = await mongoQuery.lean();
    let joinLookup = new Map();
    if (this.joinTable && this.joinCondition?.kind === "eq" && isColumn(this.joinCondition.column) && isColumn(this.joinCondition.value)) {
      let baseJoinColumn = this.joinCondition.column;
      let targetJoinColumn = this.joinCondition.value;
      if (baseJoinColumn.table !== this.baseTable.tableName && targetJoinColumn.table === this.baseTable.tableName) {
        baseJoinColumn = this.joinCondition.value;
        targetJoinColumn = this.joinCondition.column;
      }
      if (baseJoinColumn.table === this.baseTable.tableName && targetJoinColumn.table === this.joinTable.tableName) {
        const joinIds = [...new Set(results.map((doc) => {
          const value = getColumnValue(doc, baseJoinColumn);
          return value == null ? null : String(value);
        }).filter(Boolean))];
        if (joinIds.length > 0) {
          const joinModel = getModel(this.joinTable);
          const targetField = getMongoFieldName(targetJoinColumn.name);
          const joinDocs = await joinModel.find({ [targetField]: { $in: joinIds } }).lean();
          joinLookup = new Map(joinDocs.map((doc) => [String(doc[targetField] ?? doc._id), doc]));
        }
      }
    }
    if (this.selection && Object.values(this.selection).some((v) => v?.kind === "count")) {
      const totalCount = await model.countDocuments(query);
      return [{ count: totalCount }];
    }
    return results.map((doc) => {
      const result = {};
      if (this.selection) {
        const joinedDoc = this.joinTable && this.joinCondition?.kind === "eq" && isColumn(this.joinCondition.column) && isColumn(this.joinCondition.value) ? (() => {
          let baseJoinColumn = this.joinCondition.column;
          if (baseJoinColumn.table !== this.baseTable.tableName) {
            baseJoinColumn = this.joinCondition.value;
          }
          const key = getColumnValue(doc, baseJoinColumn);
          return key == null ? null : joinLookup.get(String(key)) ?? null;
        })() : null;
        Object.entries(this.selection).forEach(([key, value]) => {
          if (value?.kind === "count") {
            result[key] = results.length;
          } else if (value?.kind === "column") {
            if (value.table === this.baseTable.tableName) {
              result[key] = getColumnValue(doc, value);
            } else if (this.joinTable && value.table === this.joinTable.tableName) {
              result[key] = getColumnValue(joinedDoc, value);
            } else {
              result[key] = null;
            }
          } else {
            result[key] = value;
          }
        });
        return result;
      }
      return { ...doc, id: doc._id || doc.id };
    });
  }
  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}
class InsertQuery {
  constructor(table) {
    this.table = table;
    this.values_ = null;
  }
  values(value) {
    this.values_ = value;
    return this;
  }
  async returning() {
    const model = getModel(this.table);
    const input = Array.isArray(this.values_) ? this.values_ : [this.values_];
    const inserted = [];
    for (const doc of input) {
      const created = await model.create(doc);
      inserted.push({
        ...created.toObject(),
        id: created._id
      });
    }
    return inserted;
  }
}
class UpdateQuery {
  constructor(table) {
    this.table = table;
    this.patch = {};
    this.whereCondition = null;
  }
  set(value) {
    this.patch = value;
    return this;
  }
  where(condition) {
    this.whereCondition = condition;
    return this;
  }
  async returning() {
    const model = getModel(this.table);
    const query = buildMongoQuery(this.whereCondition);
    const updated = await model.find(query);
    const results = [];
    for (const doc of updated) {
      Object.assign(doc, this.patch);
      if ("updatedAt" in doc) {
        doc.updatedAt = this.patch.updatedAt ?? new Date();
      }
      await doc.save();
      results.push({
        ...doc.toObject(),
        id: doc._id
      });
    }
    return results;
  }
}
class DeleteQuery {
  constructor(table) {
    this.table = table;
    this.whereCondition = null;
  }
  where(condition) {
    this.whereCondition = condition;
    return this;
  }
  async returning() {
    const model = getModel(this.table);
    const query = buildMongoQuery(this.whereCondition);
    const toDelete = await model.find(query);
    const results = [];
    for (const doc of toDelete) {
      results.push({
        ...doc.toObject(),
        id: doc._id
      });
      await model.deleteOne({ _id: doc._id });
    }
    return results;
  }
}
const db = {
  select(selection) {
    return new SelectQuery(selection);
  },
  insert(table) {
    return new InsertQuery(table);
  },
  update(table) {
    return new UpdateQuery(table);
  },
  delete(table) {
    return new DeleteQuery(table);
  }
};
export {
  Agriculture,
  Education,
  Grievance,
  Healthcare,
  Job,
  User,
  agricultureTable,
  and,
  count,
  createColumn,
  db,
  desc,
  educationTable,
  eq,
  grievancesTable,
  healthcareTable,
  ilike,
  jobsTable,
  or,
  usersTable
};

