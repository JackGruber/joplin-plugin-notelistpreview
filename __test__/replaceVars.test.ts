import { Notelist } from "../src/notelist";
import * as moment from "moment";

let notelist = null;

describe("replaceVars", function () {
  beforeEach(async () => {
    notelist = new Notelist() as any;
    notelist.settings = {};
  });

  afterEach(async () => {});

  const referenzDate = new Date(2021, 5, 21, 15, 30, 45);

  //let now = new Date(Date.now());
  //let momentDate = moment(now);

  const testDates = {
    referenzDate: referenzDate,
    minus2Day: moment(referenzDate).subtract(2, "d"),
    minus5Day: moment(referenzDate).subtract(5, "d"),
    minus30Day: moment(referenzDate).subtract(30, "d"),
    minus3Month: moment(referenzDate).subtract(3, "m"),
  };

  const testCases = [
    {
      description: "Date 1",
      string: "Test {{date}} date",
      props: {
        note: {
          user_updated_time: testDates.minus2Day,
          user_created_time: testDates.minus5Day,
          tags: [],
        },
      },
      dateFormatJoplin: "DD/MM/YYYY",
      timeFormatJoplin: "HH:mm",
      daysHumanizeDate: "1",
      expected: 'Test <span class="date">19/06/2021 15:30</span> date',
    },
    {
      description: "Date 2",
      string: "Test {{date}} date",
      props: {
        note: {
          user_updated_time: testDates.minus30Day,
          user_created_time: testDates.minus3Month,
          tags: [],
        },
      },
      dateFormatJoplin: "DD/MM/YYYY",
      timeFormatJoplin: "HH:mm",
      daysHumanizeDate: "7",
      expected: 'Test <span class="date">22/05/2021 15:30</span> date',
    },
    {
      description: "Date 3",
      string: "Test {{date}} date",
      props: {
        note: {
          user_updated_time: testDates.minus30Day,
          user_created_time: testDates.minus3Month,
          tags: [],
        },
      },
      dateFormatJoplin: "YYYY-MM-DD",
      timeFormatJoplin: "HH-mm",
      daysHumanizeDate: "7",
      expected: 'Test <span class="date">2021-05-22 15-30</span> date',
    },
    {
      description: "Humanize",
      string: "Test {{date}} date",
      props: {
        note: {
          user_updated_time: testDates.minus2Day,
          user_created_time: testDates.minus3Month,
          tags: [],
        },
      },
      dateFormatJoplin: "DD/MM/YYYY",
      timeFormatJoplin: "HH:mm",
      daysHumanizeDate: "7",
      expected: 'Test <span class="date">2 days ago</span> date',
    },
    {
      description: "Humanize",
      string: "Test {{date}} date",
      props: {
        note: {
          user_updated_time: testDates.minus2Day,
          user_created_time: testDates.minus3Month,
          tags: [],
        },
      },
      dateFormatJoplin: "DD/MM/YYYY",
      timeFormatJoplin: "HH:mm",
      daysHumanizeDate: "7",
      expected: 'Test <span class="date">2 days ago</span> date',
    },
    {
      description: "No Tag",
      string: "Test {{tags}} tags",
      props: {
        note: {
          user_updated_time: testDates.minus2Day,
          user_created_time: testDates.minus3Month,
          tags: [],
        },
      },
      dateFormatJoplin: "DD/MM/YYYY",
      timeFormatJoplin: "HH:mm",
      daysHumanizeDate: "7",
      expected: "Test  tags",
    },
    {
      description: "One Tag",
      string: "Test {{tags}} tags",
      props: {
        note: {
          user_updated_time: testDates.minus2Day,
          user_created_time: testDates.minus3Month,
          tags: [{ title: "first" }],
        },
      },
      dateFormatJoplin: "DD/MM/YYYY",
      timeFormatJoplin: "HH:mm",
      daysHumanizeDate: "7",
      expected:
        'Test <span class="tags"><span class="tag">first</span></span> tags',
    },
    {
      description: "More Tag",
      string: "Test {{tags}} tags",
      props: {
        note: {
          user_updated_time: testDates.minus2Day,
          user_created_time: testDates.minus3Month,
          tags: [{ title: "first" }, { title: "second" }, { title: "more" }],
        },
      },
      dateFormatJoplin: "DD/MM/YYYY",
      timeFormatJoplin: "HH:mm",
      daysHumanizeDate: "7",
      expected:
        'Test <span class="tags"><span class="tag">first</span> <span class="tag">more</span> <span class="tag">second</span></span> tags',
    },
    {
      description: "Created time",
      string: "Test {{createdTime}} date",
      props: {
        note: {
          user_updated_time: testDates.minus2Day,
          user_created_time: testDates.minus5Day,
          tags: [],
        },
      },
      dateFormatJoplin: "DD/MM/YYYY",
      timeFormatJoplin: "HH:mm",
      daysHumanizeDate: "1",
      expected: 'Test <span class="date">16/06/2021 15:30</span> date',
    },
    {
      description: "Updated time",
      string: "Test {{updatedTime}} date",
      props: {
        note: {
          user_updated_time: testDates.minus2Day,
          user_created_time: testDates.minus5Day,
          tags: [],
        },
      },
      dateFormatJoplin: "DD/MM/YYYY",
      timeFormatJoplin: "HH:mm",
      daysHumanizeDate: "1",
      expected: 'Test <span class="date">19/06/2021 15:30</span> date',
    },
    {
      description: "Updated time (lower)",
      string: "Test {{updatedtime}} date",
      props: {
        note: {
          user_updated_time: testDates.minus2Day,
          user_created_time: testDates.minus5Day,
          tags: [],
        },
      },
      dateFormatJoplin: "DD/MM/YYYY",
      timeFormatJoplin: "HH:mm",
      daysHumanizeDate: "1",
      expected: 'Test <span class="date">19/06/2021 15:30</span> date',
    },
    {
      description: "Created time (upper)",
      string: "Test {{CREATEDTIME}} date",
      props: {
        note: {
          user_updated_time: testDates.minus2Day,
          user_created_time: testDates.minus5Day,
          tags: [],
        },
      },
      dateFormatJoplin: "DD/MM/YYYY",
      timeFormatJoplin: "HH:mm",
      daysHumanizeDate: "1",
      expected: 'Test <span class="date">16/06/2021 15:30</span> date',
    },
    {
      description: "URL",
      string: "Test {{url}} url",
      props: {
        note: {
          user_updated_time: testDates.minus2Day,
          user_created_time: testDates.minus5Day,
          tags: [],
          source_url:
            "https://joplinapp.org/help/api/references/rest_api#properties",
        },
      },
      dateFormatJoplin: "DD/MM/YYYY",
      timeFormatJoplin: "HH:mm",
      daysHumanizeDate: "1",
      expected:
        'Test <span class="url">https://joplinapp.org/help/api/references/rest_api#properties</span> url',
    },
  ];

  for (const testCase of testCases) {
    it(`${testCase.description}`, async () => {
      const spyOnDateNow = jest
        .spyOn(Date, "now")
        .mockImplementation(() => referenzDate.getTime());

      notelist.settings["dateFormatJoplin"] = testCase.dateFormatJoplin;
      notelist.settings["timeFormatJoplin"] = testCase.timeFormatJoplin;
      notelist.settings["daysHumanizeDate"] = testCase.daysHumanizeDate;

      const result = await notelist.replaceVars(
        testCase.string,
        testCase.props
      );
      expect(result).toBe(testCase.expected);

      spyOnDateNow.mockRestore();
    });
  }
});
