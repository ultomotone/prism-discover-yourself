-- Rebuild assessment_scoring_key with correct mappings
DELETE FROM assessment_scoring_key;

-- Demographics & Contact (1-8) - META (unscored)
INSERT INTO assessment_scoring_key (question_id, scale_type, tag, reverse_scored, pair_group, social_desirability, fc_map, weight) VALUES
(1, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(2, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(3, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(4, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(5, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(6, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(7, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(8, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0);

-- Self-Reported Behavioral Outcomes (9-12) - META
INSERT INTO assessment_scoring_key (question_id, scale_type, tag, reverse_scored, pair_group, social_desirability, fc_map, weight) VALUES
(9, 'LIKERT_1_7', NULL, false, NULL, false, NULL, 0),
(10, 'LIKERT_1_7', NULL, false, NULL, false, NULL, 0),
(11, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(12, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0);

-- Life Events & Mindset (13-16) - META
INSERT INTO assessment_scoring_key (question_id, scale_type, tag, reverse_scored, pair_group, social_desirability, fc_map, weight) VALUES
(13, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(14, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(15, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(16, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0);

-- Core PRISM Functions (1/2) - Questions 17-64 (Strength items)
INSERT INTO assessment_scoring_key (question_id, scale_type, tag, reverse_scored, pair_group, social_desirability, fc_map, weight) VALUES
-- Ti_S (17-22)
(17, 'LIKERT_1_5', 'Ti_S', false, NULL, false, NULL, 1),
(18, 'LIKERT_1_5', 'Ti_S', false, NULL, false, NULL, 1),
(19, 'LIKERT_1_5', 'Ti_S', false, NULL, false, NULL, 1),
(20, 'LIKERT_1_5', 'Ti_S', false, NULL, false, NULL, 1),
(21, 'LIKERT_1_5', 'Ti_S', false, NULL, false, NULL, 1),
(22, 'LIKERT_1_5', 'Ti_S', false, NULL, false, NULL, 1),
-- Te_S (23-28)
(23, 'LIKERT_1_5', 'Te_S', false, NULL, false, NULL, 1),
(24, 'LIKERT_1_5', 'Te_S', false, NULL, false, NULL, 1),
(25, 'LIKERT_1_5', 'Te_S', false, NULL, false, NULL, 1),
(26, 'LIKERT_1_5', 'Te_S', false, NULL, false, NULL, 1),
(27, 'LIKERT_1_5', 'Te_S', false, NULL, false, NULL, 1),
(28, 'LIKERT_1_5', 'Te_S', false, NULL, false, NULL, 1),
-- Fi_S (29-34)
(29, 'LIKERT_1_5', 'Fi_S', false, NULL, false, NULL, 1),
(30, 'LIKERT_1_5', 'Fi_S', false, NULL, false, NULL, 1),
(31, 'LIKERT_1_5', 'Fi_S', false, NULL, false, NULL, 1),
(32, 'LIKERT_1_5', 'Fi_S', false, NULL, false, NULL, 1),
(33, 'LIKERT_1_5', 'Fi_S', false, NULL, false, NULL, 1),
(34, 'LIKERT_1_5', 'Fi_S', false, NULL, false, NULL, 1),
-- Fe_S (35-40)
(35, 'LIKERT_1_5', 'Fe_S', false, NULL, false, NULL, 1),
(36, 'LIKERT_1_5', 'Fe_S', false, NULL, false, NULL, 1),
(37, 'LIKERT_1_5', 'Fe_S', false, NULL, false, NULL, 1),
(38, 'LIKERT_1_5', 'Fe_S', false, NULL, false, NULL, 1),
(39, 'LIKERT_1_5', 'Fe_S', false, NULL, false, NULL, 1),
(40, 'LIKERT_1_5', 'Fe_S', false, NULL, false, NULL, 1),
-- Ni_S (41-46)
(41, 'LIKERT_1_5', 'Ni_S', false, NULL, false, NULL, 1),
(42, 'LIKERT_1_5', 'Ni_S', false, NULL, false, NULL, 1),
(43, 'LIKERT_1_5', 'Ni_S', false, NULL, false, NULL, 1),
(44, 'LIKERT_1_5', 'Ni_S', false, NULL, false, NULL, 1),
(45, 'LIKERT_1_5', 'Ni_S', false, NULL, false, NULL, 1),
(46, 'LIKERT_1_5', 'Ni_S', false, NULL, false, NULL, 1),
-- Ne_S (47-52)
(47, 'LIKERT_1_5', 'Ne_S', false, NULL, false, NULL, 1),
(48, 'LIKERT_1_5', 'Ne_S', false, NULL, false, NULL, 1),
(49, 'LIKERT_1_5', 'Ne_S', false, NULL, false, NULL, 1),
(50, 'LIKERT_1_5', 'Ne_S', false, NULL, false, NULL, 1),
(51, 'LIKERT_1_5', 'Ne_S', false, NULL, false, NULL, 1),
(52, 'LIKERT_1_5', 'Ne_S', false, NULL, false, NULL, 1),
-- Si_S (53-58)
(53, 'LIKERT_1_5', 'Si_S', false, NULL, false, NULL, 1),
(54, 'LIKERT_1_5', 'Si_S', false, NULL, false, NULL, 1),
(55, 'LIKERT_1_5', 'Si_S', false, NULL, false, NULL, 1),
(56, 'LIKERT_1_5', 'Si_S', false, NULL, false, NULL, 1),
(57, 'LIKERT_1_5', 'Si_S', false, NULL, false, NULL, 1),
(58, 'LIKERT_1_5', 'Si_S', false, NULL, false, NULL, 1),
-- Se_S (59-64)
(59, 'LIKERT_1_5', 'Se_S', false, NULL, false, NULL, 1),
(60, 'LIKERT_1_5', 'Se_S', false, NULL, false, NULL, 1),
(61, 'LIKERT_1_5', 'Se_S', false, NULL, false, NULL, 1),
(62, 'LIKERT_1_5', 'Se_S', false, NULL, false, NULL, 1),
(63, 'LIKERT_1_5', 'Se_S', false, NULL, false, NULL, 1),
(64, 'LIKERT_1_5', 'Se_S', false, NULL, false, NULL, 1);

-- Core PRISM Functions (2/2) - Questions 65-104 (Dimensional items)  
INSERT INTO assessment_scoring_key (question_id, scale_type, tag, reverse_scored, pair_group, social_desirability, fc_map, weight) VALUES
-- Ti_D (65-69)
(65, 'LIKERT_1_5', 'Ti_D', false, NULL, false, NULL, 1),
(66, 'LIKERT_1_5', 'Ti_D', false, NULL, false, NULL, 1),
(67, 'LIKERT_1_5', 'Ti_D', false, NULL, false, NULL, 1),
(68, 'LIKERT_1_5', 'Ti_D', false, NULL, false, NULL, 1),
(69, 'LIKERT_1_5', 'Ti_D', false, NULL, false, NULL, 1),
-- Te_D (70-74)
(70, 'LIKERT_1_5', 'Te_D', false, NULL, false, NULL, 1),
(71, 'LIKERT_1_5', 'Te_D', false, NULL, false, NULL, 1),
(72, 'LIKERT_1_5', 'Te_D', false, NULL, false, NULL, 1),
(73, 'LIKERT_1_5', 'Te_D', false, NULL, false, NULL, 1),
(74, 'LIKERT_1_5', 'Te_D', false, NULL, false, NULL, 1),
-- Fi_D (75-79)
(75, 'LIKERT_1_5', 'Fi_D', false, NULL, false, NULL, 1),
(76, 'LIKERT_1_5', 'Fi_D', false, NULL, false, NULL, 1),
(77, 'LIKERT_1_5', 'Fi_D', false, NULL, false, NULL, 1),
(78, 'LIKERT_1_5', 'Fi_D', false, NULL, false, NULL, 1),
(79, 'LIKERT_1_5', 'Fi_D', false, NULL, false, NULL, 1),
-- Fe_D (80-84)
(80, 'LIKERT_1_5', 'Fe_D', false, NULL, false, NULL, 1),
(81, 'LIKERT_1_5', 'Fe_D', false, NULL, false, NULL, 1),
(82, 'LIKERT_1_5', 'Fe_D', false, NULL, false, NULL, 1),
(83, 'LIKERT_1_5', 'Fe_D', false, NULL, false, NULL, 1),
(84, 'LIKERT_1_5', 'Fe_D', false, NULL, false, NULL, 1),
-- Ni_D (85-89)
(85, 'LIKERT_1_5', 'Ni_D', false, NULL, false, NULL, 1),
(86, 'LIKERT_1_5', 'Ni_D', false, NULL, false, NULL, 1),
(87, 'LIKERT_1_5', 'Ni_D', false, NULL, false, NULL, 1),
(88, 'LIKERT_1_5', 'Ni_D', false, NULL, false, NULL, 1),
(89, 'LIKERT_1_5', 'Ni_D', false, NULL, false, NULL, 1),
-- Ne_D (90-94)
(90, 'LIKERT_1_5', 'Ne_D', false, NULL, false, NULL, 1),
(91, 'LIKERT_1_5', 'Ne_D', false, NULL, false, NULL, 1),
(92, 'LIKERT_1_5', 'Ne_D', false, NULL, false, NULL, 1),
(93, 'LIKERT_1_5', 'Ne_D', false, NULL, false, NULL, 1),
(94, 'LIKERT_1_5', 'Ne_D', false, NULL, false, NULL, 1),
-- Si_D (95-99)
(95, 'LIKERT_1_5', 'Si_D', false, NULL, false, NULL, 1),
(96, 'LIKERT_1_5', 'Si_D', false, NULL, false, NULL, 1),
(97, 'LIKERT_1_5', 'Si_D', false, NULL, false, NULL, 1),
(98, 'LIKERT_1_5', 'Si_D', false, NULL, false, NULL, 1),
(99, 'LIKERT_1_5', 'Si_D', false, NULL, false, NULL, 1),
-- Se_D (100-104)
(100, 'LIKERT_1_5', 'Se_D', false, NULL, false, NULL, 1),
(101, 'LIKERT_1_5', 'Se_D', false, NULL, false, NULL, 1),
(102, 'LIKERT_1_5', 'Se_D', false, NULL, false, NULL, 1),
(103, 'LIKERT_1_5', 'Se_D', false, NULL, false, NULL, 1),
(104, 'LIKERT_1_5', 'Se_D', false, NULL, false, NULL, 1);

-- Regulation / Neuroticism Index (105-128)
INSERT INTO assessment_scoring_key (question_id, scale_type, tag, reverse_scored, pair_group, social_desirability, fc_map, weight) VALUES
(105, 'LIKERT_1_7', 'N', false, NULL, false, NULL, 1),
(106, 'LIKERT_1_7', 'N_R', true, NULL, false, NULL, 1),
(107, 'LIKERT_1_7', 'N', false, NULL, false, NULL, 1),
(108, 'LIKERT_1_7', 'N', false, NULL, false, NULL, 1),
(109, 'LIKERT_1_7', 'N_R', true, NULL, false, NULL, 1),
(110, 'LIKERT_1_7', 'N', false, NULL, false, NULL, 1),
(111, 'LIKERT_1_7', 'N_R', true, NULL, false, NULL, 1),
(112, 'LIKERT_1_7', 'N', false, NULL, false, NULL, 1),
(113, 'LIKERT_1_7', 'N_R', true, NULL, false, NULL, 1),
(114, 'LIKERT_1_7', 'N', false, NULL, false, NULL, 1),
(115, 'LIKERT_1_7', 'N_R', true, NULL, false, NULL, 1),
(116, 'LIKERT_1_7', 'N', false, NULL, false, NULL, 1),
(117, 'LIKERT_1_7', 'N_R', true, NULL, false, NULL, 1),
(118, 'LIKERT_1_7', 'N', false, NULL, false, NULL, 1),
(119, 'LIKERT_1_7', 'N_R', true, NULL, false, NULL, 1),
(120, 'LIKERT_1_7', 'N', false, NULL, false, NULL, 1),
(121, 'LIKERT_1_7', 'N_R', true, NULL, false, NULL, 1),
(122, 'LIKERT_1_7', 'N', false, NULL, false, NULL, 1),
(123, 'LIKERT_1_7', 'N_R', true, NULL, false, NULL, 1),
(124, 'LIKERT_1_7', 'N', false, NULL, false, NULL, 1),
(125, 'LIKERT_1_7', 'N_R', true, NULL, false, NULL, 1),
(126, 'LIKERT_1_7', 'N', false, NULL, false, NULL, 1),
(127, 'LIKERT_1_7', 'N_R', true, NULL, false, NULL, 1),
(128, 'LIKERT_1_7', 'N', false, NULL, false, NULL, 1);

-- Situational Choices (129-140) - Forced Choice with function/block mappings
INSERT INTO assessment_scoring_key (question_id, scale_type, tag, reverse_scored, pair_group, social_desirability, fc_map, weight) VALUES
(129, 'FORCED_CHOICE_4', NULL, false, NULL, false, '{"A":"Te","B":"Si","C":"Se","D":"Ne"}', 1),
(130, 'FORCED_CHOICE_4', NULL, false, NULL, false, '{"A":"Te","B":"Si","C":"Se","D":"Ne"}', 1),
(131, 'FORCED_CHOICE_5', NULL, false, NULL, false, '{"A":"Ni","B":"Ne","C":"Si","D":"Fe","E":"Ti"}', 1),
(132, 'FORCED_CHOICE_4', NULL, false, NULL, false, '{"A":"Te","B":"Si","C":"Se","D":"Ne"}', 1),
(133, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(134, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(135, 'FORCED_CHOICE_4', NULL, false, NULL, false, '{"A":"Fe","B":"Si","C":"Se","D":"Ne"}', 1),
(136, 'FORCED_CHOICE_4', NULL, false, NULL, false, '{"A":"Te","B":"Si","C":"Se","D":"Ne"}', 1),
(137, 'FORCED_CHOICE_4', NULL, false, NULL, false, '{"A":"Te","B":"Si","C":"Se","D":"Fe"}', 1),
(138, 'FORCED_CHOICE_4', NULL, false, NULL, false, '{"A":"Te","B":"Si","C":"Se","D":"Ne"}', 1),
(139, 'FORCED_CHOICE_4', NULL, false, NULL, false, '{"A":"Te","B":"Si","C":"Se","D":"Ne"}', 1),
(140, 'FORCED_CHOICE_4', NULL, false, NULL, false, '{"A":"Te","B":"Si","C":"Se","D":"Ne"}', 1);

-- Block sections (141-188) - map to block counts
INSERT INTO assessment_scoring_key (question_id, scale_type, tag, reverse_scored, pair_group, social_desirability, fc_map, weight) VALUES
-- Strengths Ownership (141-152) - Core
(141, 'LIKERT_1_5', 'Core', false, NULL, false, NULL, 1),
(142, 'LIKERT_1_5', 'Core', false, NULL, false, NULL, 1),
(143, 'LIKERT_1_5', 'Core', false, NULL, false, NULL, 1),
(144, 'LIKERT_1_5', 'Core', false, NULL, false, NULL, 1),
(145, 'LIKERT_1_5', 'Core', false, NULL, false, NULL, 1),
(146, 'LIKERT_1_5', 'Core', false, NULL, false, NULL, 1),
(147, 'LIKERT_1_5', 'Core', false, NULL, false, NULL, 1),
(148, 'LIKERT_1_5', 'Core', false, NULL, false, NULL, 1),
(149, 'LIKERT_1_5', 'Core', false, NULL, false, NULL, 1),
(150, 'LIKERT_1_5', 'Core', false, NULL, false, NULL, 1),
(151, 'LIKERT_1_5', 'Core', false, NULL, false, NULL, 1),
(152, 'LIKERT_1_5', 'Core', false, NULL, false, NULL, 1),
-- Properness / Rigid Standards (153-164) - Critic  
(153, 'LIKERT_1_5', 'Critic', false, NULL, false, NULL, 1),
(154, 'LIKERT_1_5', 'Critic', false, NULL, false, NULL, 1),
(155, 'LIKERT_1_5', 'Critic', false, NULL, false, NULL, 1),
(156, 'LIKERT_1_5', 'Critic', false, NULL, false, NULL, 1),
(157, 'LIKERT_1_5', 'Critic', false, NULL, false, NULL, 1),
(158, 'LIKERT_1_5', 'Critic', false, NULL, false, NULL, 1),
(159, 'LIKERT_1_5', 'Critic', false, NULL, false, NULL, 1),
(160, 'LIKERT_1_5', 'Critic', false, NULL, false, NULL, 1),
(161, 'LIKERT_1_5', 'Critic', false, NULL, false, NULL, 1),
(162, 'LIKERT_1_5', 'Critic', false, NULL, false, NULL, 1),
(163, 'LIKERT_1_5', 'Critic', false, NULL, false, NULL, 1),
(164, 'LIKERT_1_5', 'Critic', false, NULL, false, NULL, 1),
-- Developmental Openness (165-176) - Hidden
(165, 'LIKERT_1_5', 'Hidden', false, NULL, false, NULL, 1),
(166, 'LIKERT_1_5', 'Hidden', false, NULL, false, NULL, 1),
(167, 'LIKERT_1_5', 'Hidden', false, NULL, false, NULL, 1),
(168, 'LIKERT_1_5', 'Hidden', false, NULL, false, NULL, 1),
(169, 'LIKERT_1_5', 'Hidden', false, NULL, false, NULL, 1),
(170, 'LIKERT_1_5', 'Hidden', false, NULL, false, NULL, 1),
(171, 'LIKERT_1_5', 'Hidden', false, NULL, false, NULL, 1),
(172, 'LIKERT_1_5', 'Hidden', false, NULL, false, NULL, 1),
(173, 'LIKERT_1_5', 'Hidden', false, NULL, false, NULL, 1),
(174, 'LIKERT_1_5', 'Hidden', false, NULL, false, NULL, 1),
(175, 'LIKERT_1_5', 'Hidden', false, NULL, false, NULL, 1),
(176, 'LIKERT_1_5', 'Hidden', false, NULL, false, NULL, 1),
-- Instinctive Action / Somatic Readiness (177-188) - Instinct
(177, 'LIKERT_1_5', 'Instinct', false, NULL, false, NULL, 1),
(178, 'LIKERT_1_5', 'Instinct', false, NULL, false, NULL, 1),
(179, 'LIKERT_1_5', 'Instinct', false, NULL, false, NULL, 1),
(180, 'LIKERT_1_5', 'Instinct', false, NULL, false, NULL, 1),
(181, 'LIKERT_1_5', 'Instinct', false, NULL, false, NULL, 1),
(182, 'LIKERT_1_5', 'Instinct', false, NULL, false, NULL, 1),
(183, 'LIKERT_1_5', 'Instinct', false, NULL, false, NULL, 1),
(184, 'LIKERT_1_5', 'Instinct', false, NULL, false, NULL, 1),
(185, 'LIKERT_1_5', 'Instinct', false, NULL, false, NULL, 1),
(186, 'LIKERT_1_5', 'Instinct', false, NULL, false, NULL, 1),
(187, 'LIKERT_1_5', 'Instinct', false, NULL, false, NULL, 1),
(188, 'LIKERT_1_5', 'Instinct', false, NULL, false, NULL, 1);

-- Growth Over Time (189-196) - META
INSERT INTO assessment_scoring_key (question_id, scale_type, tag, reverse_scored, pair_group, social_desirability, fc_map, weight) VALUES
(189, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(190, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(191, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(192, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(193, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(194, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(195, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(196, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0);

-- Self-Regulation & Boundaries (197-204) - META
INSERT INTO assessment_scoring_key (question_id, scale_type, tag, reverse_scored, pair_group, social_desirability, fc_map, weight) VALUES
(197, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(198, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(199, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(200, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(201, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(202, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(203, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(204, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0);

-- Trauma / Healing Context (205-210) - META
INSERT INTO assessment_scoring_key (question_id, scale_type, tag, reverse_scored, pair_group, social_desirability, fc_map, weight) VALUES
(205, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(206, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(207, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(208, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(209, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0),
(210, 'META'::assessment_scale_type, NULL, false, NULL, false, NULL, 0);

-- Work Context & Style (211-216) - META forced choice
INSERT INTO assessment_scoring_key (question_id, scale_type, tag, reverse_scored, pair_group, social_desirability, fc_map, weight) VALUES
(211, 'FORCED_CHOICE_4', NULL, false, NULL, false, NULL, 0),
(212, 'FORCED_CHOICE_4', NULL, false, NULL, false, NULL, 0),
(213, 'FORCED_CHOICE_4', NULL, false, NULL, false, NULL, 0),
(214, 'FORCED_CHOICE_4', NULL, false, NULL, false, NULL, 0),
(215, 'FORCED_CHOICE_4', NULL, false, NULL, false, NULL, 0),
(216, 'FORCED_CHOICE_4', NULL, false, NULL, false, NULL, 0);

-- State Check (217-221) - State modifiers
INSERT INTO assessment_scoring_key (question_id, scale_type, tag, reverse_scored, pair_group, social_desirability, fc_map, weight) VALUES
(217, 'STATE_1_7', 'STATE_STRESS', false, NULL, false, NULL, 1),
(218, 'STATE_1_7', 'STATE_MOOD', false, NULL, false, NULL, 1),
(219, 'STATE_1_7', 'STATE_SLEEP', false, NULL, false, NULL, 1),
(220, 'STATE_1_7', 'STATE_TIME', false, NULL, false, NULL, 1),
(221, 'STATE_1_7', 'STATE_FOCUS', false, NULL, false, NULL, 1);

-- Polarity Preferences (222-229) - Forced choice with function mappings
INSERT INTO assessment_scoring_key (question_id, scale_type, tag, reverse_scored, pair_group, social_desirability, fc_map, weight) VALUES
(222, 'FORCED_CHOICE_2', NULL, false, NULL, false, '{"A":"Ti","B":"Te"}', 1),
(223, 'FORCED_CHOICE_2', NULL, false, NULL, false, '{"A":"Fi","B":"Fe"}', 1),
(224, 'FORCED_CHOICE_2', NULL, false, NULL, false, '{"A":"Ni","B":"Ne"}', 1),
(225, 'FORCED_CHOICE_2', NULL, false, NULL, false, '{"A":"Si","B":"Se"}', 1),
(226, 'FORCED_CHOICE_2', NULL, false, NULL, false, '{"A":"Ti","B":"Fi"}', 1),
(227, 'FORCED_CHOICE_2', NULL, false, NULL, false, '{"A":"Te","B":"Fe"}', 1),
(228, 'FORCED_CHOICE_2', NULL, false, NULL, false, '{"A":"Ni","B":"Si"}', 1),
(229, 'FORCED_CHOICE_2', NULL, false, NULL, false, '{"A":"Ne","B":"Se"}', 1);

-- Validity & Quality Control (230-246) - Function pairs + SD items
INSERT INTO assessment_scoring_key (question_id, scale_type, tag, reverse_scored, pair_group, social_desirability, fc_map, weight) VALUES
(230, 'LIKERT_1_5', 'Ti_S', false, 'P1', false, NULL, 1),
(231, 'LIKERT_1_5', 'Ti_S', true, 'P1', false, NULL, 1),
(232, 'LIKERT_1_5', 'Fe_S', false, 'P2', false, NULL, 1),
(233, 'LIKERT_1_5', 'Fe_S', true, 'P2', false, NULL, 1),
(234, 'LIKERT_1_5', 'Se_S', false, 'P3', false, NULL, 1),
(235, 'LIKERT_1_5', 'Se_S', true, 'P3', false, NULL, 1),
(236, 'LIKERT_1_5', 'Si_S', false, 'P4', false, NULL, 1),
(237, 'LIKERT_1_5', 'Si_S', true, 'P4', false, NULL, 1),
-- Social Desirability items (238-243)
(238, 'LIKERT_1_5', NULL, false, NULL, true, NULL, 0),
(239, 'LIKERT_1_5', NULL, false, NULL, true, NULL, 0),
(240, 'LIKERT_1_5', NULL, false, NULL, true, NULL, 0),
(241, 'LIKERT_1_5', NULL, false, NULL, true, NULL, 0),
(242, 'LIKERT_1_5', NULL, false, NULL, true, NULL, 0),
(243, 'LIKERT_1_5', NULL, false, NULL, true, NULL, 0),
-- Additional function items (244-246)
(244, 'LIKERT_1_5', 'Ti_S', false, NULL, false, NULL, 1),
(245, 'LIKERT_1_5', 'Te_S', false, NULL, false, NULL, 1),
(246, 'LIKERT_1_5', 'Ne_S', false, NULL, false, NULL, 1);

-- Update scoring config for state question IDs
UPDATE scoring_config SET value = '{"stress":217,"mood":218,"sleep":219,"time":220,"focus":221}' WHERE key = 'state_qids';

-- Add unique constraint and validation check
ALTER TABLE assessment_scoring_key ADD CONSTRAINT unique_question_id UNIQUE (question_id);
ALTER TABLE assessment_scoring_key ADD CONSTRAINT meta_tag_check CHECK (scale_type <> 'META'::assessment_scale_type OR tag IS NULL);