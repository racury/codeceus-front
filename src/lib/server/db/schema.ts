import { pgTable, serial, integer, text, timestamp, boolean, index, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const problems = pgTable('problems', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	difficultyRating: integer('difficulty_rating'),
	timeLimit: text('time_limit').notNull().default('1000ms'),
	memoryLimit: text('memory_limit').notNull().default('256MB'),
	description: text('description').notNull(),
	inputFormat: text('input_format'),
	outputFormat: text('output_format'),
	sampleInput: text('sample_input'),
	sampleOutput: text('sample_output'),
	hint: text('hint'),
	createdById: text('created_by_id').references(() => user.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const categories = pgTable('categories', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique()
});

export const problemsToCategories = pgTable('problems_to_categories', {
	problemId: integer('problem_id')
		.notNull()
		.references(() => problems.id, { onDelete: 'cascade' }),
	categoryId: integer('category_id')
		.notNull()
		.references(() => categories.id, { onDelete: 'cascade' })
}, (t) => [
	primaryKey({ columns: [t.problemId, t.categoryId] })
]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").notNull().default("user"),
  rating: integer("rating").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const submissions = pgTable('submissions', {
	id: serial('id').primaryKey(),
	problemId: integer('problem_id')
		.notNull()
		.references(() => problems.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	language: text('language').notNull(),
	code: text('code').notNull(),
	status: text('status').notNull().default('pending'),
	runtime: integer('runtime'),
	memory: integer('memory'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const testcases = pgTable('testcases', {
	id: serial('id').primaryKey(),
	problemId: integer('problem_id')
		.notNull()
		.references(() => problems.id, { onDelete: 'cascade' }),
	input: text('input').notNull(),
	output: text('output').notNull(),
	isPublic: boolean('is_public').default(false).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const problemsets = pgTable('problemsets', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
	createdById: text('created_by_id')
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const problemsetProblems = pgTable('problemset_problems', {
	problemsetId: integer('problemset_id')
		.notNull()
		.references(() => problemsets.id, { onDelete: 'cascade' }),
	problemId: integer('problem_id')
		.notNull()
		.references(() => problems.id, { onDelete: 'cascade' }),
	order: integer('order').notNull().default(0)
}, (t) => [
	primaryKey({ columns: [t.problemsetId, t.problemId] })
]);

export const roadmaps = pgTable('roadmaps', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
	createdById: text('created_by_id')
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const roadmapNodes = pgTable('roadmap_nodes', {
	id: text('id').primaryKey(),
	roadmapId: integer('roadmap_id')
		.notNull()
		.references(() => roadmaps.id, { onDelete: 'cascade' }),
	problemsetId: integer('problemset_id')
		.notNull()
		.references(() => problemsets.id, { onDelete: 'cascade' }),
	positionX: integer('position_x').notNull().default(0),
	positionY: integer('position_y').notNull().default(0)
});

export const roadmapEdges = pgTable('roadmap_edges', {
	id: text('id').primaryKey(),
	roadmapId: integer('roadmap_id')
		.notNull()
		.references(() => roadmaps.id, { onDelete: 'cascade' }),
	sourceId: text('source_id')
		.notNull()
		.references(() => roadmapNodes.id, { onDelete: 'cascade' }),
	targetId: text('target_id')
		.notNull()
		.references(() => roadmapNodes.id, { onDelete: 'cascade' })
});

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  submissions: many(submissions),
  problemsets: many(problemsets),
  roadmaps: many(roadmaps),
}));

export const problemsRelations = relations(problems, ({ many }) => ({
	categories: many(problemsToCategories),
	submissions: many(submissions),
	testcases: many(testcases),
	problemsets: many(problemsetProblems)
}));

export const problemsetsRelations = relations(problemsets, ({ one, many }) => ({
	createdBy: one(user, {
		fields: [problemsets.createdById],
		references: [user.id]
	}),
	problems: many(problemsetProblems)
}));

export const problemsetProblemsRelations = relations(problemsetProblems, ({ one }) => ({
	problemset: one(problemsets, {
		fields: [problemsetProblems.problemsetId],
		references: [problemsets.id]
	}),
	problem: one(problems, {
		fields: [problemsetProblems.problemId],
		references: [problems.id]
	})
}));

export const testcasesRelations = relations(testcases, ({ one }) => ({
	problem: one(problems, {
		fields: [testcases.problemId],
		references: [problems.id]
	})
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
	problems: many(problemsToCategories)
}));

export const problemsToCategoriesRelations = relations(problemsToCategories, ({ one }) => ({
	problem: one(problems, {
		fields: [problemsToCategories.problemId],
		references: [problems.id]
	}),
	category: one(categories, {
		fields: [problemsToCategories.categoryId],
		references: [categories.id]
	})
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const submissionRelations = relations(submissions, ({ one }) => ({
	user: one(user, {
		fields: [submissions.userId],
		references: [user.id],
	}),
	problem: one(problems, {
		fields: [submissions.problemId],
		references: [problems.id],
	}),
}));

export const roadmapsRelations = relations(roadmaps, ({ one, many }) => ({
	createdBy: one(user, {
		fields: [roadmaps.createdById],
		references: [user.id]
	}),
	nodes: many(roadmapNodes),
	edges: many(roadmapEdges)
}));

export const roadmapNodesRelations = relations(roadmapNodes, ({ one }) => ({
	roadmap: one(roadmaps, {
		fields: [roadmapNodes.roadmapId],
		references: [roadmaps.id]
	}),
	problemset: one(problemsets, {
		fields: [roadmapNodes.problemsetId],
		references: [problemsets.id]
	})
}));

export const roadmapEdgesRelations = relations(roadmapEdges, ({ one }) => ({
	roadmap: one(roadmaps, {
		fields: [roadmapEdges.roadmapId],
		references: [roadmaps.id]
	}),
	source: one(roadmapNodes, {
		fields: [roadmapEdges.sourceId],
		references: [roadmapNodes.id],
		relationName: 'outgoingEdges'
	}),
	target: one(roadmapNodes, {
		fields: [roadmapEdges.targetId],
		references: [roadmapNodes.id],
		relationName: 'incomingEdges'
	})
}));

export const competitions = pgTable('competitions', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
	startTime: timestamp('start_time').notNull(),
	endTime: timestamp('end_time').notNull(),
	createdById: text('created_by_id')
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const competitionProblems = pgTable('competition_problems', {
	competitionId: integer('competition_id')
		.notNull()
		.references(() => competitions.id, { onDelete: 'cascade' }),
	problemId: integer('problem_id')
		.notNull()
		.references(() => problems.id, { onDelete: 'cascade' }),
	order: integer('order').notNull().default(0)
}, (t) => [
	primaryKey({ columns: [t.competitionId, t.problemId] })
]);

export const competitionParticipants = pgTable('competition_participants', {
	competitionId: integer('competition_id')
		.notNull()
		.references(() => competitions.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	joinedAt: timestamp('joined_at').defaultNow().notNull()
}, (t) => [
	primaryKey({ columns: [t.competitionId, t.userId] })
]);

export const competitionsRelations = relations(competitions, ({ one, many }) => ({
	createdBy: one(user, {
		fields: [competitions.createdById],
		references: [user.id]
	}),
	problems: many(competitionProblems),
	participants: many(competitionParticipants)
}));

export const competitionProblemsRelations = relations(competitionProblems, ({ one }) => ({
	competition: one(competitions, {
		fields: [competitionProblems.competitionId],
		references: [competitions.id]
	}),
	problem: one(problems, {
		fields: [competitionProblems.problemId],
		references: [problems.id]
	})
}));

export const competitionParticipantsRelations = relations(competitionParticipants, ({ one }) => ({
	competition: one(competitions, {
		fields: [competitionParticipants.competitionId],
		references: [competitions.id]
	}),
	user: one(user, {
		fields: [competitionParticipants.userId],
		references: [user.id]
	})
}));
