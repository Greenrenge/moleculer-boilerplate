export const ADMIN_USER_ID = '__admin'

export enum LoginMethod {
	EMAIL = 'email',
	FACEBOOK = 'facebook',
	GOOGLE = 'google',
	LINE = 'line',
	APPLE = 'apple',
}

export enum PublicOrg {
	PUBLIC_ORG = 'public',
}

export const { PUBLIC_ORG } = PublicOrg

export enum Gender {
	MALE = 'M',
	FEMALE = 'F',
}

export enum EvaluatorKind {
	PUBLIC = 'public',
	ORG = 'org',
	DEPT = 'dept',
	GROUP = 'group',
	FRIEND = 'friend',
	JOB_POSITION = 'job_position',
	USER = 'user',
}

export enum SurveyKinds {
	ANNOUNCEMENT = 'announcement',
	FREE_TEXT = 'free_text',
	TWO_CHOICES = 'two_choices',
	MULTI_CHOICES = 'multi_choices',
	EMOTION = 'emotion',
	SCORING = 'scoring',
	QUIZ = 'quiz',
}

export enum RecommendKinds {
	VIDEO = 'recommend_video',
}

export enum NotificationTypes {
	BROADCAST = 'broadcast',
	DIRECT = 'direct',
	ORGANIZATION = 'organization',
}

export enum NotificationUserTypes {
	SYSTEM = 'system',
	USER = 'user',
}

export enum OwnerType {
	USER = 'user',
	ORGANIZATION = 'org',
	APPLICATION = 'app',
}

export enum NotiAskForKinds {
	FEEDBACK = 'request_evaluate_feedback',
	SKILLSET = 'request_evaluate_skillset',
}

export enum VideoProvider {
	YOUTUBE = 'youtube',
	BYTEARK = 'byteark',
	SCORM = 'scorm',
}

export enum EnumLanguages {
	TH = 'th',
	EN = 'en',
	JA = 'ja',
}

export enum Currency {
	TH = 'th',
}

export enum VideoCategoryKind {
	WHEEL_OF_LIFE = 'wheel_of_life',
	HARD_SKILL = 'hard_skill',
	SOFT_SKILL = 'soft_skill',
}

export enum StatusEnroll {
	REQUIRED = 'required',
	STARTED = 'started',
	INPROGRESS = 'inprogress',
	COMPLETED = 'completed',
}

export enum RepeatType {
	EVERY_DAY = 'everyday',
	EVERY_WEEK = 'everyweek',
	CUSTOM = 'custom',
}

export enum CustomScheduleType {
	DAILY = 'daily',
	WEEKLY = 'weekly',
	MONTHLY = 'monthly',
}

export enum Day {
	SUNDAY = 'Sunday',
	MONDAY = 'Monday',
	TUESDAY = 'Tuesday',
	WEDNESDAY = 'Wednesday',
	THURSDAY = 'Thursday',
	FRIDAY = 'Friday',
	SATURDAY = 'Saturday',
}

export enum ScheduleEventStatus {
	IDLE = 'idle',
	BUSY = 'busy',
	CANCELED = 'canceled',
}

export enum AttachmentKinds {
	IMAGE = 'image',
	URL = 'url',
}

export enum PermSubjects {
	PUBLIC_ROLE = 'public_role',
	PUBLIC_USER = 'public_user',
	APP_METADATA = 'app_metadata',
	APP_ANNOUNCEMENT = 'app_announcement',
	APP_SURVEY = 'app_survey',
	PUBLIC_METADATA = 'public_metadata',
	ORGANIZATION = 'organization',
	VDO_PACKAGE_MANAGEMENT = 'vdo_package_management',
	ADMIN_QUESTION_360 = 'admin_question_360',
	ORG_INFORMATION = 'org_information',
	ORG_MEMBER = 'org_member',
	DEPARTMENT = 'org_department',
	DEPARTMENT_MEMBER = 'org_department_member',
	JOB_POSITION = 'org_job_position',
	ORG_METADATA = 'org_metadata',
	ORG_ANNOUNCEMENT = 'org_announcement',
	ORG_SURVEY = 'org_survey',
	ORG_WELCOME_MSG = 'org_welcomeMessage',
	ROLE = 'org_role',
	VDO = 'video',
	COURSE = 'course',
	COURSE_LESSON = 'course_lesson',
	VOD_CATEGORY = 'vdo_category',
	QUIZ = 'quiz',
	GROUP = 'group',
	QUESTION_360 = 'question_360',
	VDO_CHANNEL = 'video_channel',
	VDO_PLAYLIST = 'video_playlist',
}

export enum PermActions {
	VIEW = 'view',
	CREATE = 'create',
	UPDATE = 'update',
	DELETE = 'delete',
}

export enum Period {
	MONTHLY = 'monthly',
	WEEKLY = 'weekly',
	DAILY = 'daily',
}

export enum ShareOption {
	LIMITED = 'limited',
	SHARE_ONLY = 'share_only',
	OPEN = 'open',
}

export enum ChoiceSelection {
	SINGLE = 'single',
	MULTI = 'multi',
}

export enum AudienceKind {
	PUBLIC = 'public',
	ORG = 'org',
	DEPT = 'dept',
	GROUP = 'group',
	FRIEND = 'friend',
	JOB_POSITION = 'job_position',
	USER = 'user',
}

export enum ChoiceAnswerResult {
	UNKNOWN = 'unknown',
	CORRECT = 'correct',
	INCORRECT = 'incorrect',
}

export enum AnswerStatus {
	PENDING = 'pending',
	ANSWERED = 'answered',
}

export enum Status {
	ENDED = 'ended',
	UPCOMING = 'upcoming',
	AVAILABLE = 'available',
	DISABLED = 'disabled',
}

export enum PeriodGroupByMongoMapping {
	MONTHLY = '%m/%Y',
	WEEKLY = '%V',
	DAILY = '%d/%m/%Y',
}

export enum PeriodGroupByLuxonMapping {
	MONTHLY = 'MM/yyyy',
	WEEKLY = 'WW',
	DAILY = 'dd/MM/yyyy',
}

export enum PeriodGroupByLuxonUnitsMapping {
	MONTHLY = 'months',
	WEEKLY = 'weeks',
	DAILY = 'days',
}

export enum QuestionFrequency {
	ONE_TIME = 'ONE_TIME',
	DAILY = 'DAILY',
	WEEKLY = 'WEEKLY',
	MONTHLY = 'MONTHLY',
	QUARTERLY = 'QUARTERLY',
	BIANNUALLY = 'BIANNUALLY',
	ANNUALLY = 'ANNUALLY',
}

export enum DayOfWeek {
	SUNDAY = 'Sunday',
	MONDAY = 'Monday',
	TUESDAY = 'Tuesday',
	WEDNESDAY = 'Wednesday',
	THURSDAY = 'Thursday',
	FRIDAY = 'Friday',
	SATURDAY = 'Saturday',
}

export const DateByWeek: [number, number][] = [
	[1, 7],
	[8, 14],
	[15, 21],
	[22, 31],
]

export enum QuestionCreatedType {
	TEMPLATE = 'template',
	CUSTOM = 'custom',
}

export enum OrderBy {
	DESC = 'desc',
	ASC = 'asc',
}

export enum ScoreGroupBy {
	DEPARTMENT = 'answer.deptId',
	ORGANIZATION = 'answer.orgId',
	USER = 'answer.userId',
	SURVEY = '_id',
	CATEGORY = 'category',
	KIND = 'kind',
}
