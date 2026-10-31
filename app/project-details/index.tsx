import { ImageSlider } from "@/components/ImageSlider";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./styles";

const PROJECT_DATA = (t: any) => ({
  id: "1",
  images: [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
  ],
  projectInfo: {
    title: t("project_info_title", { defaultValue: "معلومات المشروع" }),
    details: [
      { label: t("project_name_label", { defaultValue: "اسم المشروع" }), value: t("clinic_management_title") },
      { label: t("category_label", { defaultValue: "التصنيف" }), value: "HealthTech - SaaS" },
      { label: t("location_label", { defaultValue: "الموقع" }), value: t("riyadh_saudi_tag") },
      { label: t("project_status_label", { defaultValue: "حالة المشروع" }), value: t("ready_product_label", { defaultValue: "منتج جاهز وقيد التشغيل" }) },
      { label: t("launch_date_label", { defaultValue: "تاريخ الإطلاق" }), value: "2024" },
      { label: t("project_owner_label", { defaultValue: "صاحب المشروع" }), value: t("medical_tech_team_label", { defaultValue: "فريق تقني طبي" }) },
    ]
  },
  investmentDetails: {
    title: t("investment_details_title", { defaultValue: "تفاصيل الاستثمار" }),
    details: [
      { label: t("required_from_investor_label", { defaultValue: "المطلوب من المستثمر" }), value: "2,000,000 " + t("riyals") },
      { label: t("opportunity_type_label", { defaultValue: "نوع الفرصة" }), value: t("partnership") },
      { label: t("partnership_percentage_label", { defaultValue: "نسبة المشاركة" }), value: "40%" },
      { label: t("expected_return_label", { defaultValue: "العائد المتوقع" }), value: t("medium_to_high_label", { defaultValue: "متوسط الي مرتفع" }) },
    ]
  },
  keyFigures: {
    title: t("key_figures_title", { defaultValue: "تفاصيل الارقام الرئيسية" }),
    details: [
      { label: t("clinics_count_label", { defaultValue: "عدد العيادات" }), value: "120+" },
      { label: t("expected_return_rate_label", { defaultValue: "العائد المتوقع" }), value: "18% " + t("annually") },
      { label: t("investment_period_label", { defaultValue: "مدة الاستثمار" }), value: "24 " + t("months_label", { defaultValue: "شهرا" }) },
      { label: t("financing_percentage_label", { defaultValue: "نسبة التمويل" }), value: "65%" },
      { label: t("monthly_growth_rate_label", { defaultValue: "معدل النمو الشهري" }), value: "12%" },
      { label: t("total_investment_label", { defaultValue: "اجمالي الاستثمار" }), value: "12,000,000 " + t("riyals") },
      { label: t("avg_monthly_revenue_label", { defaultValue: "متوسط الاراد الشهري" }), value: "50,000 " + t("riyals") },
    ]
  },
  marketDetails: {
    title: t("market_details_title", { defaultValue: "تفاصيل السوق" }),
    details: [
      { label: t("target_group_label", { defaultValue: "الفئة المستهدفة" }), value: t("private_clinics_label", { defaultValue: "العيادات الخاصة" }) },
      { label: t("market_label", { defaultValue: "السوق" }), value: t("local_scalable_label", { defaultValue: "محلي وقابل للتوسع" }) },
      { label: t("demand_label", { defaultValue: "الطلب" }), value: t("high_increasing_label", { defaultValue: "مرتفع ومتزايد" }) },
    ]
  },
  features: {
    title: t("features_title", { defaultValue: "ما الذي يميز المشروع؟" }),
    items: [
      t("feature_1", { defaultValue: "أتمتة كاملة لإدارة العيادات" }),
      t("feature_2", { defaultValue: "تحسين كفاءة التشغيل وتقليل التكاليف" }),
      t("feature_3", { defaultValue: "نظام آمن لحماية البيانات الطبية" }),
      t("feature_4", { defaultValue: "قابلية التوسع والتطوير المستقبلي" }),
    ]
  },
  problem: {
    title: t("problem_title", { defaultValue: "المشكلة" }),
    content: t("problem_content", { defaultValue: "نعاني العديد من العيادات من الاعتماد على أنظمة ورقية وتقليدية، مما يؤدي لفقدان بيانات المرضى، تأخير المواعيد، وأخطاء إدارية تؤثر على جودة الخدمة." })
  },
  solution: {
    title: t("solution_title", { defaultValue: "الحل" }),
    content: t("solution_content", { defaultValue: "المنصة توفر نظام إدارة رقمي متكامل للعيادات، يشمل تنظيم المواعيد، إدارة الملفات الطبية، متابعة الحالات، وتقارير أداء لحظية، مع أمان وحماية كاملة للبيانات." })
  },
  futureGrowth: {
    title: t("future_growth_title", { defaultValue: "خطة النمو المستقبلية" }),
    items: [
      t("growth_1", { defaultValue: "توسع جغرافي داخل محافظات مصر المختلفة" }),
      t("growth_2", { defaultValue: "إضافة ميزات ذكاء اصطناعي لتحليلات المرضى والتنبؤ بالحالات" }),
      t("growth_3", { defaultValue: "شراكات مع مستشفيات وسلاسل عيادات كبيرة" }),
    ]
  },
  businessModel: {
    title: t("business_model_title", { defaultValue: "نموذج العمل" }),
    items: [
      t("model_1", { defaultValue: "اشتراك شهري حسب حجم العيادة وعدد الأطباء" }),
      t("model_2", { defaultValue: "خدمات إضافية مدفوعة (تقارير متقدمة، دعم فني مخصص)" }),
      t("model_3", { defaultValue: "إمكانية تقديم ميزات ذكاء اصطناعي مستقبلاً لتحليلات المرضى" }),
    ]
  }
});

export default function ProjectDetailsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === "ar";

  const project = PROJECT_DATA(t);

  const Section = ({ title, details, items, content }: any) => (
    <View style={styles.sectionCard}>
      <Text style={[styles.sectionTitle, { textAlign: isRTL ? "right" : "left" }]}>
        {title}
      </Text>
      {details && details.map((item: any, index: number) => (
        <View key={index} style={[styles.detailRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Text style={[styles.detailLabel, { textAlign: isRTL ? "right" : "left" }]}>
            {item.label} :
          </Text>
          <Text style={[styles.detailValue, { textAlign: isRTL ? "right" : "left" }]}>
            {item.value}
          </Text>
        </View>
      ))}
      {items && items.map((item: any, index: number) => (
        <View key={index} style={[styles.listItem, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={styles.bullet} />
          <Text style={[styles.listText, { textAlign: isRTL ? "right" : "left" }]}>
            {item}
          </Text>
        </View>
      ))}
      {content && (
        <Text style={[styles.sectionContent, { textAlign: isRTL ? "right" : "left" }]}>
          {content}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={{ position: "relative" }}>
          <ImageSlider images={project.images} />
          <View
            style={[
              styles.headerButtons,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name={isRTL ? "chevron-forward" : "chevron-back"}
                size={24}
                color={Colors.white}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="heart-outline" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Section {...project.projectInfo} />
          <Section {...project.investmentDetails} />
          <Section {...project.keyFigures} />
          <Section {...project.marketDetails} />
          <Section {...project.features} />
          <Section {...project.problem} />
          <Section {...project.solution} />
          <Section {...project.futureGrowth} />
          <Section {...project.businessModel} />
        </View>
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.contactButton} activeOpacity={0.8}>
          <Text style={styles.contactButtonText}>
            {t("contact_project_owner")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
